import { describe, expect, it, vi } from 'vitest';
import { Argon2id } from 'oslo/password';

vi.mock('$lib/db/client', () => ({ getDB: vi.fn() }));

import { POST } from '../../../routes/api/account/password/+server';
import { getDB } from '$lib/db/client';

describe('api account password', () => {
	it('returns 401 when unauthenticated', async () => {
		const req = new Request('http://localhost/api/account/password', {
			method: 'POST',
			body: JSON.stringify({})
		});
		const res = await POST({ request: req, locals: { user: null } } as any);
		expect(res.status).toBe(401);
	});

	it('returns 400 for missing fields', async () => {
		const req = new Request('http://localhost/api/account/password', {
			method: 'POST',
			body: JSON.stringify({ currentPassword: '', newPassword: '', confirmPassword: '' })
		});
		const res = await POST({ request: req, locals: { user: { id: 1 } } } as any);
		expect(res.status).toBe(400);
	});

	it('returns 400 for incorrect current password', async () => {
		const hash = await new Argon2id().hash('OldPassword123!');
		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({ where: () => ({ get: async () => ({ id: 1, password_hash: hash }) }) })
			})
		} as any);

		const req = new Request('http://localhost/api/account/password', {
			method: 'POST',
			body: JSON.stringify({
				currentPassword: 'WrongPassword123!',
				newPassword: 'NewPassword123!',
				confirmPassword: 'NewPassword123!'
			})
		});
		const res = await POST({ request: req, locals: { user: { id: 1 } } } as any);
		expect(res.status).toBe(400);
	});

	it('updates password and clears mustChangePassword', async () => {
		const hash = await new Argon2id().hash('OldPassword123!');
		const whereMock = vi.fn(async () => undefined);
		const setMock = vi.fn(() => ({ where: whereMock }));
		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({ where: () => ({ get: async () => ({ id: 1, password_hash: hash }) }) })
			}),
			update: () => ({ set: setMock })
		} as any);

		const req = new Request('http://localhost/api/account/password', {
			method: 'POST',
			body: JSON.stringify({
				currentPassword: 'OldPassword123!',
				newPassword: 'NewPassword123!',
				confirmPassword: 'NewPassword123!'
			})
		});
		const res = await POST({ request: req, locals: { user: { id: 1 } } } as any);
		expect(res.status).toBe(200);
		expect(setMock).toHaveBeenCalledWith(
			expect.objectContaining({
				mustChangePassword: 0
			})
		);
	});
});
