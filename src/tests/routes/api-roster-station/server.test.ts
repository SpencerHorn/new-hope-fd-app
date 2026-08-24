import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/db/client', () => ({ getDB: vi.fn() }));
vi.mock('drizzle-orm', async (importOriginal) => {
	const actual = (await importOriginal()) as Record<string, unknown>;
	return {
		...actual,
		and: vi.fn((...parts: unknown[]) => ({ type: 'and', parts })),
		ne: vi.fn((left: unknown, right: unknown) => ({ type: 'ne', left, right })),
		isNull: vi.fn((column: unknown) => ({ type: 'isNull', column }))
	};
});

import { GET } from '../../../routes/api/roster/station/+server';
import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { DEFAULT_ADMIN_EMAIL } from '$lib/server/adminSeed';
import { and, isNull, ne } from 'drizzle-orm';

describe('api roster station', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('excludes soft-deleted users and the system admin from the station roster', async () => {
		const rows = [{ firstName: 'Jane', lastName: 'Smith' }];
		const orderByMock = vi.fn(() => ({ all: () => rows }));
		const whereMock = vi.fn(() => ({ orderBy: orderByMock }));

		vi.mocked(getDB).mockReturnValue({
			select: () => ({
				from: () => ({ where: whereMock })
			})
		} as any);

		const res = await GET();

		expect(res.status).toBe(200);
		expect(ne).toHaveBeenCalledWith(users.personalEmail, DEFAULT_ADMIN_EMAIL);
		expect(isNull).toHaveBeenCalledWith(users.deletedAt);

		const combinedPredicate = vi.mocked(and).mock.results[0]?.value;
		expect(whereMock).toHaveBeenCalledWith(combinedPredicate);

		const body = await res.json();
		expect(body).toEqual(rows);
	});
});
