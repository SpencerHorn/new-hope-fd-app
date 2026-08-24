import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/db/client', () => ({ getDB: vi.fn() }));
vi.mock('drizzle-orm', async (importOriginal) => {
	const actual = (await importOriginal()) as Record<string, unknown>;
	return {
		...actual,
		and: vi.fn((...parts: unknown[]) => ({ type: 'and', parts })),
		inArray: vi.fn((column: unknown, values: unknown[]) => ({ type: 'inArray', column, values })),
		ne: vi.fn((left: unknown, right: unknown) => ({ type: 'ne', left, right })),
		isNull: vi.fn((column: unknown) => ({ type: 'isNull', column }))
	};
});

import { POST } from '../../../routes/api/roster/csv/+server';
import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { DEFAULT_ADMIN_EMAIL } from '$lib/server/adminSeed';
import { and, inArray, isNull, ne } from 'drizzle-orm';

describe('api roster csv', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('builds query with selected roles and system admin exclusion', async () => {
		const rows = [
			{ firstName: 'Jane', lastName: 'Smith', role: 'volunteer', personalEmail: 'jane@example.com' }
		];
		const whereMock = vi.fn(() => ({ all: () => rows }));

		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({ where: whereMock })
			})
		} as any);

		const req = new Request('http://localhost/api/roster/csv', {
			method: 'POST',
			body: JSON.stringify({
				groups: { volunteer: true },
				fields: ['personalEmail', 'role']
			})
		});

		const res = await POST({ request: req } as any);

		expect(res.status).toBe(200);
		expect(inArray).toHaveBeenCalledWith(users.role, ['volunteer']);
		expect(ne).toHaveBeenCalledWith(users.personalEmail, DEFAULT_ADMIN_EMAIL);
		expect(isNull).toHaveBeenCalledWith(users.deletedAt);

		const combinedPredicate = vi.mocked(and).mock.results[0]?.value;
		expect(whereMock).toHaveBeenCalledWith(combinedPredicate);
	});

	it('forces last and first name columns first in CSV output', async () => {
		const rows = [
			{ firstName: 'Alex', lastName: 'Brown', role: 'employee', personalEmail: 'alex@example.com' }
		];

		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({
					where: () => ({ all: () => rows })
				})
			})
		} as any);

		const req = new Request('http://localhost/api/roster/csv', {
			method: 'POST',
			body: JSON.stringify({
				groups: { employee: true },
				fields: ['role', 'personalEmail']
			})
		});

		const res = await POST({ request: req } as any);
		const text = await res.text();
		const [header, firstRow] = text.split('\n');

		expect(header).toBe('lastName,firstName,role,personalEmail');
		expect(firstRow).toContain('Brown,Alex,employee,alex@example.com');
	});

	it('escapes CSV values containing commas and quotes', async () => {
		const rows = [
			{
				firstName: 'Pat',
				lastName: 'ONeil',
				address: '12 Main St, Unit "A"',
				role: 'volunteer',
				personalEmail: 'pat@example.com'
			}
		];

		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({
					where: () => ({ all: () => rows })
				})
			})
		} as any);

		const req = new Request('http://localhost/api/roster/csv', {
			method: 'POST',
			body: JSON.stringify({
				groups: { volunteer: true },
				fields: ['address']
			})
		});

		const res = await POST({ request: req } as any);
		const text = await res.text();
		const lines = text.split('\n');

		expect(lines[0]).toBe('lastName,firstName,address');
		expect(lines[1]).toContain('"12 Main St, Unit ""A"""');
	});
});
