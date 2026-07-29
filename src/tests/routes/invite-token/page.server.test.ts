import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/db/client', () => ({ getDB: vi.fn() }));
vi.mock('$lib/server/auth', () => ({ getLucia: vi.fn() }));

import { actions, load } from '../../../routes/invite/[token]/+page.server';
import { getDB } from '$lib/db/client';
import { getLucia } from '$lib/server/auth';

function makeFormEvent(token: string, values: Record<string, string>) {
	const formData = new FormData();
	for (const [k, v] of Object.entries(values)) formData.set(k, v);
	return {
		params: { token },
		request: { formData: async () => formData },
		cookies: { set: vi.fn() }
	} as any;
}

describe('invite token page', () => {
	it('redirects to login for invalid token on load', async () => {
		vi.mocked(getDB).mockResolvedValue({
			select: () => ({ from: () => ({ where: () => ({ get: async () => undefined }) }) })
		} as any);

		await expect(load({ params: { token: 'bad' } } as any)).rejects.toMatchObject({
			status: 302,
			location: '/login'
		});
	});

	it('returns validation error for short password', async () => {
		const result = await actions.default(makeFormEvent('token1', { password: 'short', confirm: 'short' }));
		expect(result).toMatchObject({ status: 400, data: { message: 'Password must be at least 10 characters.' } });
	});

	it('returns validation error for mismatch', async () => {
		const result = await actions.default(
			makeFormEvent('token1', { password: 'GoodPassword123!', confirm: 'Different123!' })
		);
		expect(result).toMatchObject({ status: 400, data: { message: 'Passwords do not match.' } });
	});

	it('creates account, sets cookie, and redirects on success', async () => {
		const db = {
			select: vi
				.fn()
				.mockReturnValueOnce({
					from: () => ({ where: () => ({ get: async () => ({ email: 'invitee@example.com' }) }) })
				})
				.mockReturnValueOnce({ from: () => ({ where: () => ({ get: async () => undefined }) }) })
				.mockReturnValueOnce({ from: () => ({ where: () => ({ get: async () => undefined }) }) }),
			insert: vi.fn().mockReturnValue({
				values: () => ({ returning: async () => [{ id: 9 }] })
			}),
			delete: vi.fn().mockReturnValue({
				where: async () => undefined
			})
		} as any;
		vi.mocked(getDB).mockResolvedValue(db);

		vi.mocked(getLucia).mockResolvedValue({
			createSession: async () => ({ id: 'session-9' }),
			createSessionCookie: () => ({
				name: 'auth_session',
				value: 'cookie',
				attributes: { httpOnly: true }
			})
		} as any);

		const event = makeFormEvent('token1', {
			password: 'GoodPassword123!',
			confirm: 'GoodPassword123!'
		});

		await expect(actions.default(event)).rejects.toMatchObject({ status: 302, location: '/' });
		expect(event.cookies.set).toHaveBeenCalledWith(
			'auth_session',
			'cookie',
			expect.objectContaining({ path: '/' })
		);
	});

	it('rejects invite when member profile already exists for the email', async () => {
		const db = {
			select: vi
				.fn()
				.mockReturnValueOnce({
					from: () => ({ where: () => ({ get: async () => ({ email: 'invitee@example.com' }) }) })
				})
				.mockReturnValueOnce({ from: () => ({ where: () => ({ get: async () => ({ id: 42 }) }) }) })
				.mockReturnValueOnce({ from: () => ({ where: () => ({ get: async () => ({ id: 42 }) }) }) }),
			delete: vi.fn().mockReturnValue({ where: async () => undefined })
		} as any;
		vi.mocked(getDB).mockResolvedValue(db);

		const result = await actions.default(
			makeFormEvent('token1', { password: 'GoodPassword123!', confirm: 'GoodPassword123!' })
		);

		expect(result).toMatchObject({
			status: 400,
			data: { message: 'A member profile for this email already exists. Please sign in.' }
		});
	});
});
