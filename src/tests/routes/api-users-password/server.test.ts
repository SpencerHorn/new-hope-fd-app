import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/db/client', () => ({ getDB: vi.fn() }));

import { POST } from '../../../routes/api/users/[id]/password/+server';
import { getDB } from '$lib/db/client';

describe('api users/[id]/password', () => {
	it('rejects non-admin users', async () => {
		const req = new Request('http://localhost/api/users/3/password', {
			method: 'POST',
			body: JSON.stringify({ temporaryPassword: 'Temporary123!' })
		});
		const res = await POST({
			params: { id: '3' },
			request: req,
			locals: { appUser: { role: 'employee' } }
		} as any);
		expect(res.status).toBe(403);
	});

	it('returns 404 when profile is missing', async () => {
		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({ where: () => ({ get: async () => null }) })
			})
		} as any);

		const req = new Request('http://localhost/api/users/3/password', {
			method: 'POST',
			body: JSON.stringify({ temporaryPassword: 'Temporary123!' })
		});
		const res = await POST({
			params: { id: '3' },
			request: req,
			locals: { appUser: { role: 'administrator' } }
		} as any);
		expect(res.status).toBe(404);
	});

	it('creates auth account when missing', async () => {
		const insertValues = vi.fn(async () => undefined);
		const getMock = vi
			.fn()
			.mockResolvedValueOnce({ id: 3, personalEmail: 'new.user@example.com' })
			.mockResolvedValueOnce(null);
		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({
					where: () => ({
						get: getMock
					})
				})
			}),
			insert: () => ({ values: insertValues })
		} as any);

		const req = new Request('http://localhost/api/users/3/password', {
			method: 'POST',
			body: JSON.stringify({ temporaryPassword: 'Temporary123!' })
		});
		const res = await POST({
			params: { id: '3' },
			request: req,
			locals: { appUser: { role: 'administrator' } }
		} as any);
		expect(res.status).toBe(200);
		expect(insertValues).toHaveBeenCalledWith(
			expect.objectContaining({
				email: 'new.user@example.com',
				mustChangePassword: 1
			})
		);
	});

	it('updates existing auth account and returns temporary password', async () => {
		const whereMock = vi.fn(async () => undefined);
		const setMock = vi.fn(() => ({ where: whereMock }));
		const getMock = vi
			.fn()
			.mockResolvedValueOnce({ id: 3, personalEmail: 'existing@example.com' })
			.mockResolvedValueOnce({ id: 91, email: 'existing@example.com' });
		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({
					where: () => ({
						get: getMock
					})
				})
			}),
			update: () => ({ set: setMock })
		} as any);

		const req = new Request('http://localhost/api/users/3/password', {
			method: 'POST',
			body: JSON.stringify({ temporaryPassword: 'Temporary123!' })
		});
		const res = await POST({
			params: { id: '3' },
			request: req,
			locals: { appUser: { role: 'administrator' } }
		} as any);

		expect(res.status).toBe(200);
		expect(setMock).toHaveBeenCalledWith(
			expect.objectContaining({
				mustChangePassword: 1,
				email: 'existing@example.com'
			})
		);
		await expect(res.json()).resolves.toMatchObject({
			success: true,
			temporaryPassword: 'Temporary123!'
		});
	});
});
