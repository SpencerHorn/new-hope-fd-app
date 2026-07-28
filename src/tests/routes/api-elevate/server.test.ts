import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/db/client', () => ({ getDB: vi.fn() }));

import { PATCH } from '../../../routes/api/elevate/[id]/+server';
import { getDB } from '$lib/db/client';

describe('api elevate', () => {
	it('rejects invalid role', async () => {
		vi.mocked(getDB).mockReturnValue({} as any);
		const req = new Request('http://localhost/api/elevate/1', {
			method: 'PATCH',
			body: JSON.stringify({ role: 'chief' })
		});

		const res = await PATCH({ params: { id: '1' }, request: req } as any);
		expect(res.status).toBe(400);
	});

	it('updates role for valid payload', async () => {
		vi.mocked(getDB).mockReturnValue({
			update: () => ({
				set: () => ({
					where: () => ({
						returning: () => ({ get: () => ({ id: 1, role: 'volunteer' }) })
					})
				})
			})
		} as any);

		const req = new Request('http://localhost/api/elevate/1', {
			method: 'PATCH',
			body: JSON.stringify({ role: 'volunteer' })
		});
		const res = await PATCH({ params: { id: '1' }, request: req } as any);
		expect(res.status).toBe(200);
		await expect(res.json()).resolves.toMatchObject({ role: 'volunteer' });
	});
});
