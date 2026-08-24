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

import { POST } from '../../../routes/api/roster/pdf/+server';
import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { DEFAULT_ADMIN_EMAIL } from '$lib/server/adminSeed';
import { and, isNull, ne } from 'drizzle-orm';

describe('api roster pdf', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('excludes soft-deleted users when no role groups are selected', async () => {
		const whereMock = vi.fn(() => ({ all: () => [] }));

		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({ where: whereMock })
			})
		} as any);

		const req = new Request('http://localhost/api/roster/pdf', {
			method: 'POST',
			body: JSON.stringify({ groups: {}, fields: ['role'] })
		});

		const res = await POST({ request: req } as any);

		expect(res.status).toBe(200);
		expect(ne).toHaveBeenCalledWith(users.personalEmail, DEFAULT_ADMIN_EMAIL);
		expect(isNull).toHaveBeenCalledWith(users.deletedAt);

		const combinedPredicate = vi.mocked(and).mock.results[0]?.value;
		expect(whereMock).toHaveBeenCalledWith(combinedPredicate);
	});

	it('excludes soft-deleted users when role groups are selected', async () => {
		const whereMock = vi.fn(() => ({ all: () => [] }));

		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({ where: whereMock })
			})
		} as any);

		const req = new Request('http://localhost/api/roster/pdf', {
			method: 'POST',
			body: JSON.stringify({ groups: { volunteer: true }, fields: ['role'] })
		});

		const res = await POST({ request: req } as any);

		expect(res.status).toBe(200);
		expect(isNull).toHaveBeenCalledWith(users.deletedAt);

		const combinedPredicate = vi.mocked(and).mock.results[0]?.value;
		expect(whereMock).toHaveBeenCalledWith(combinedPredicate);
	});
});
