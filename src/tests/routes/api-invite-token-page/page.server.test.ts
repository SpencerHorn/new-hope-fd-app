import { describe, expect, it } from 'vitest';
import { load } from '../../../routes/api/invite/[token]/+page.server';

describe('legacy api invite token page', () => {
	it('redirects to canonical invite path', async () => {
		await expect(load({ params: { token: 'abc123' } } as any)).rejects.toMatchObject({
			status: 302,
			location: '/invite/abc123'
		});
	});
});
