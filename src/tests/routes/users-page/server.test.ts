import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/db/client', () => ({ getDB: vi.fn() }));

import { actions, load } from '../../../routes/users/+page.server';
import { getDB } from '$lib/db/client';

function makeCreateEvent(role: string, fields: Record<string, string>) {
	const form = new FormData();
	for (const [k, v] of Object.entries(fields)) form.set(k, v);
	return {
		locals: { appUser: { role } },
		request: { formData: async () => form }
	} as any;
}

describe('users page server', () => {
	it('load returns all users for admin and sets admin flags', async () => {
		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({ where: () => ({ all: async () => [{ id: 1, firstName: 'Jane' }] }) })
			})
		} as any);

		const result = await load({
			url: new URL('http://localhost/users'),
			locals: { appUser: { role: 'administrator', id: 1 } }
		} as any);

		expect(result).toMatchObject({
			users: [{ id: 1, firstName: 'Jane' }],
			canManageRoles: true,
			canDeleteUsers: true,
			canManageUsers: true,
			canManageDeletedUsers: true
		});
	});

	it('load returns empty result for probationary user without id', async () => {
		vi.mocked(getDB).mockResolvedValue({} as any);

		const result = await load({
			url: new URL('http://localhost/users'),
			locals: { appUser: { role: 'probationary' } }
		} as any);

		expect(result).toMatchObject({
			users: [],
			canManageRoles: false,
			canDeleteUsers: false,
			canManageUsers: false,
			canManageDeletedUsers: false
		});
	});

	it('create action blocks non-admin users', async () => {
		const result = await actions.create(
			makeCreateEvent('employee', {
				firstName: 'A',
				lastName: 'B',
				personalEmail: 'a@b.com',
				phone: '(111) 222-3333',
				role: 'administrator'
			})
		);

		expect(result).toMatchObject({ status: 403, data: { error: 'Forbidden' } });
	});

	it('create action allows admin users', async () => {
		const valuesMock = vi.fn(() => undefined);
		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({ where: () => ({ get: async () => undefined }) })
			}),
			insert: () => ({ values: valuesMock })
		} as any);

		const result = await actions.create(
			makeCreateEvent('administrator', {
				firstName: 'A',
				lastName: 'B',
				personalEmail: 'a@b.com',
				phone: '(111) 222-3333',
				role: 'employee'
			})
		);

		expect(result).toEqual({ success: true });
		expect(valuesMock).toHaveBeenCalledWith(
			expect.objectContaining({ role: 'employee', personalEmail: 'a@b.com', phone: '(111) 222-3333' })
		);
	});

	it('create action rejects duplicate email or phone', async () => {
		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({ where: () => ({ get: async () => ({ id: 9 }) }) })
			})
		} as any);

		const result = await actions.create(
			makeCreateEvent('administrator', {
				firstName: 'A',
				lastName: 'B',
				personalEmail: 'a@b.com',
				phone: '(111) 222-3333',
				role: 'employee'
			})
		);

		expect(result).toMatchObject({ status: 400, data: { error: 'A user with that email or phone already exists.' } });
	});
});
