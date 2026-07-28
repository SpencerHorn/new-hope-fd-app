import { describe, expect, it } from 'vitest';
import { load } from '../../../routes/+page.server';

describe('root page redirect', () => {
	it('redirects to dashboard', async () => {
		await expect(load()).rejects.toMatchObject({ status: 302, location: '/dashboard' });
	});
});
