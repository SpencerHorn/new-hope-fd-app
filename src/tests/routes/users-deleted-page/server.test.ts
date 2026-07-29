import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/db/client', () => ({ getDB: vi.fn() }));

import { actions, load } from '../../../routes/users/deleted/+page.server';
import { getDB } from '$lib/db/client';

function makeActionEvent(role: string, actionFields: Record<string, string>) {
	const formData = new FormData();
	for (const [k, v] of Object.entries(actionFields)) {
		formData.set(k, v);
	}

	return {
		locals: { appUser: { role } },
		request: { formData: async () => formData }
	} as any;
}

describe('users deleted page', () => {
	it('load blocks non-admin users', async () => {
		await expect(load({ locals: { appUser: { role: 'employee' } } } as any)).rejects.toMatchObject({
			status: 302,
			location: '/dashboard'
		});
	});

	it('load returns deleted users for admins', async () => {
		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({
					where: () => ({
						all: async () => [{ id: 4, firstName: 'Deleted', personalEmail: 'd@example.com' }]
					})
				})
			})
		} as any);

		const result = await load({ locals: { appUser: { role: 'administrator' } } } as any);

		expect(result).toMatchObject({
			canManageDeletedUsers: true,
			users: [{ id: 4, firstName: 'Deleted', personalEmail: 'd@example.com' }]
		});
	});

	it('restore action clears deletedAt for admins', async () => {
		const whereMock = vi.fn(async () => undefined);
		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({
					where: () => ({ get: async () => ({ id: 7 }) })
				})
			}),
			update: () => ({
				set: () => ({ where: whereMock })
			})
		} as any);

		const result = await actions.restore(makeActionEvent('administrator', { userId: '7' }));

		expect(result).toEqual({ success: true });
		expect(whereMock).toHaveBeenCalled();
	});

	it('purge action deletes profile and auth user for admins', async () => {
		const whereDeleteMock = vi.fn(async () => undefined);
		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({
					where: () => ({ get: async () => ({ id: 9, personalEmail: 'gone@example.com' }) })
				})
			}),
			delete: () => ({ where: whereDeleteMock })
		} as any);

		const result = await actions.purge(makeActionEvent('administrator', { userId: '9' }));

		expect(result).toEqual({ success: true });
		expect(whereDeleteMock).toHaveBeenCalledTimes(2);
	});
});