import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/db/client', () => ({ getDB: vi.fn() }));

import { GET } from '../../../routes/api/users/search/+server';
import { getDB } from '$lib/db/client';

describe('api users search', () => {
	it('returns empty array when query missing', async () => {
		const res = await GET({ url: new URL('http://localhost/api/users/search') } as any);
		expect(res.status).toBe(200);
		await expect(res.json()).resolves.toEqual([]);
	});

	it('returns filtered users when query provided', async () => {
		vi.mocked(getDB).mockReturnValue({
			select: () => ({
				from: () => ({ where: () => ({ all: () => [{ id: 1, firstName: 'John' }] }) })
			})
		} as any);

		const res = await GET({ url: new URL('http://localhost/api/users/search?query=john') } as any);
		expect(res.status).toBe(200);
		await expect(res.json()).resolves.toEqual([{ id: 1, firstName: 'John' }]);
	});
});
