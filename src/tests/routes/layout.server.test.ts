import { describe, expect, it } from 'vitest';
import { load } from '../../routes/+layout.server';

describe('root layout guard', () => {
	it('redirects unauthenticated users away from protected paths', async () => {
		await expect(
			load({
				locals: { user: null },
				url: new URL('http://localhost/users')
			} as any)
		).rejects.toMatchObject({ status: 302, location: '/login' });
	});

	it('allows unauthenticated users on login', async () => {
		const result = await load({
			locals: { user: null },
			url: new URL('http://localhost/login')
		} as any);

		expect(result).toEqual({ user: null });
	});

	it('allows unauthenticated users on invite paths', async () => {
		const result = await load({
			locals: { user: null },
			url: new URL('http://localhost/invite/abc123')
		} as any);

		expect(result).toEqual({ user: null });
	});
});
