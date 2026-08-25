import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/db/client', () => ({ getDB: vi.fn() }));

import { load } from '../../../routes/users/[id]/+page.server';
import { getDB } from '$lib/db/client';

describe('users/[id] page server', () => {
	it('blocks non-admin users from viewing another user', async () => {
		vi.mocked(getDB).mockResolvedValue({} as any);

		const result = await load({
			params: { id: '2' },
			locals: { appUser: { role: 'volunteer', id: 1 } }
		} as any);

		expect(result).toMatchObject({
			user: null,
			error: 'User not found',
			canManageUsers: false
		});
	});

	it('allows admin users to load a user and manage users', async () => {
		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({
					where: () => ({
						get: async () => ({ id: 2, firstName: 'Jane' }),
						all: async () => []
					})
				})
			})
		} as any);

		const result = await load({
			params: { id: '2' },
			locals: { appUser: { role: 'administrator', id: 1 } }
		} as any);

		expect(result).toMatchObject({
			user: { id: 2, firstName: 'Jane' },
			canManageUsers: true
		});
	});
});
