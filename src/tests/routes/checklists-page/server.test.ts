import { describe, expect, it } from 'vitest';

import { load } from '../../../routes/checklists/+page.server';

describe('checklists page access', () => {
	it('redirects probationary users to dashboard', async () => {
		await expect(
			load({ locals: { appUser: { role: 'probationary' } } } as any)
		).rejects.toMatchObject({ status: 302, location: '/dashboard' });
	});

	it('allows volunteer users', async () => {
		const result = await load({ locals: { appUser: { role: 'volunteer' } } } as any);
		expect(result).toEqual({});
	});

	it('allows employee users', async () => {
		const result = await load({ locals: { appUser: { role: 'employee' } } } as any);
		expect(result).toEqual({});
	});

	it('allows administrator users', async () => {
		const result = await load({ locals: { appUser: { role: 'administrator' } } } as any);
		expect(result).toEqual({});
	});
});
