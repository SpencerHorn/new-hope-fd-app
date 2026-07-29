import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/db/client', () => ({ getDB: vi.fn() }));

import { load } from '../../../routes/dashboard/+page.server';
import { getDB } from '$lib/db/client';

describe('dashboard page server', () => {
	it('returns user not found when no app user id exists', async () => {
		const result = await load({ locals: { appUser: null, mustChangePassword: false } } as any);

		expect(result).toEqual({
			user: null,
			error: 'User not found',
			mustChangePassword: false
		});
	});

	it('returns user not found when profile is missing', async () => {
		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({
					where: () => ({ get: async () => null })
				})
			})
		} as any);

		const result = await load({ locals: { appUser: { id: 9 }, mustChangePassword: true } } as any);

		expect(result).toEqual({
			user: null,
			error: 'User not found',
			mustChangePassword: true
		});
	});

	it('loads dashboard profile for logged in user', async () => {
		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({
					where: () => ({ get: async () => ({ id: 3, firstName: 'Jamie' }) })
				})
			})
		} as any);

		const result = await load({ locals: { appUser: { id: 3 }, mustChangePassword: false } } as any);

		expect(result).toEqual({
			user: { id: 3, firstName: 'Jamie' },
			error: null,
			mustChangePassword: false
		});
	});
});
