import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/db/client', () => ({ getDB: vi.fn() }));
vi.mock('drizzle-orm', async (importOriginal) => {
	const actual = (await importOriginal()) as Record<string, unknown>;
	return {
		...actual,
		and: vi.fn((...parts: unknown[]) => ({ type: 'and', parts })),
		inArray: vi.fn((column: unknown, values: unknown[]) => ({ type: 'inArray', column, values })),
		isNull: vi.fn((column: unknown) => ({ type: 'isNull', column }))
	};
});

import { GET } from '../../../routes/api/roster/management/+server';
import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { and, inArray, isNull } from 'drizzle-orm';

describe('api roster management', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('excludes soft-deleted users from the management roster', async () => {
		const rows = [{ firstName: 'Jane', lastName: 'Smith', role: 'volunteer' }];
		const orderByMock = vi.fn(() => ({ all: () => rows }));
		const whereMock = vi.fn(() => ({ orderBy: orderByMock }));

		vi.mocked(getDB).mockReturnValue({
			select: () => ({
				from: () => ({ where: whereMock })
			})
		} as any);

		const res = await GET();

		expect(res.status).toBe(200);
		expect(inArray).toHaveBeenCalledWith(users.role, ['volunteer', 'employee']);
		expect(isNull).toHaveBeenCalledWith(users.deletedAt);

		const combinedPredicate = vi.mocked(and).mock.results[0]?.value;
		expect(whereMock).toHaveBeenCalledWith(combinedPredicate);

		const body = await res.json();
		expect(body).toEqual(rows);
	});
});
