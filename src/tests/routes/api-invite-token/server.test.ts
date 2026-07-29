import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/db/client', () => ({ getDB: vi.fn() }));
vi.mock('$lib/server/auth', () => ({ getLucia: vi.fn() }));

import { POST } from '../../../routes/api/invite/[token]/+server';
import { getDB } from '$lib/db/client';

describe('api invite token', () => {
	it('rejects account creation when a member profile already exists for the invite email', async () => {
		const db = {
			select: vi
				.fn()
				.mockReturnValueOnce({
					from: () => ({ where: () => ({ get: async () => ({ email: 'invitee@example.com' }) }) })
				})
				.mockReturnValueOnce({ from: () => ({ where: () => ({ get: async () => ({ id: 77 }) }) }) }),
			delete: vi.fn().mockReturnValue({ where: async () => undefined })
		} as any;
		vi.mocked(getDB).mockResolvedValue(db);

		const req = new Request('http://localhost/api/invite/token-123', {
			method: 'POST',
			body: JSON.stringify({ password: 'GoodPassword123!' })
		});

		const res = await POST({ params: { token: 'token-123' }, request: req, cookies: {} } as any);

		expect(res.status).toBe(400);
		await expect(res.json()).resolves.toEqual({
			error: 'A member profile for this email already exists.'
		});
	});
});