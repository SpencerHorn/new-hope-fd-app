import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/db/client', () => ({
	getDB: vi.fn()
}));

vi.mock('$lib/server/auth', () => ({
	getLucia: vi.fn()
}));

import { actions } from '../../../routes/login/+page.server';
import { getDB } from '$lib/db/client';
import { getLucia } from '$lib/server/auth';
import { Argon2id } from 'oslo/password';

function makeEvent(form: Record<string, string>) {
	const formData = new FormData();
	for (const [key, value] of Object.entries(form)) formData.set(key, value);

	return {
		request: { formData: async () => formData },
		cookies: { set: vi.fn() }
	} as any;
}

describe('login action', () => {
	it('returns 400 on missing credentials', async () => {
		const result = await actions.default(makeEvent({ email: '', password: '' }));
		expect(result).toMatchObject({ status: 400, data: { message: 'Missing email or password' } });
	});

	it('returns 400 on unknown user', async () => {
		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({
					where: () => ({ get: async () => undefined })
				})
			})
		} as any);

		const result = await actions.default(makeEvent({ email: 'nobody@example.com', password: 'x' }));
		expect(result).toMatchObject({ status: 400, data: { message: 'Invalid email or password' } });
	});

	it('sets session cookie and redirects on success', async () => {
		const hash = await new Argon2id().hash('GoodPassword123!');
		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({
					where: () => ({
						get: async () => ({ id: 7, email: 'admin@newhopefd.org', password_hash: hash })
					})
				})
			})
		} as any);

		vi.mocked(getLucia).mockResolvedValue({
			createSession: async () => ({ id: 'session-1' }),
			createSessionCookie: () => ({
				name: 'auth_session',
				value: 'cookie-value',
				attributes: { httpOnly: true }
			})
		} as any);

		const event = makeEvent({ email: 'admin@newhopefd.org', password: 'GoodPassword123!' });
		await expect(actions.default(event)).rejects.toMatchObject({ status: 302, location: '/' });
		expect(event.cookies.set).toHaveBeenCalledWith(
			'auth_session',
			'cookie-value',
			expect.objectContaining({ path: '/' })
		);
	});
});
