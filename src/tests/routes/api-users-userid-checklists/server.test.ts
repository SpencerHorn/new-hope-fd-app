import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/db/client', () => ({ getDB: vi.fn() }));

import { GET } from '../../../routes/api/users/[userId]/checklists/+server';
import { getDB } from '$lib/db/client';

describe('api users/[userId]/checklists', () => {
	it('returns 400 for invalid user id', async () => {
		vi.mocked(getDB).mockResolvedValue({} as any);
		const res = await GET({ params: { userId: 'nope' }, locals: {} } as any);
		expect(res.status).toBe(400);
	});

	it('blocks probationary users from viewing other users checklists', async () => {
		vi.mocked(getDB).mockResolvedValue({} as any);
		const res = await GET({
			params: { userId: '2' },
			locals: { appUser: { role: 'probationary', id: 1 } }
		} as any);

		expect(res.status).toBe(403);
	});
});
