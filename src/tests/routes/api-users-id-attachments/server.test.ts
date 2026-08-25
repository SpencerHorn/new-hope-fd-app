import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/db/client', () => ({ getDB: vi.fn() }));

import { GET, POST } from '../../../routes/api/users/[id]/attachments/+server';
import { getDB } from '$lib/db/client';

describe('api users/[id]/attachments', () => {
	it('GET rejects users who are not self or admin', async () => {
		const res = await GET({
			params: { id: '5' },
			locals: { appUser: { role: 'volunteer', id: 1 } }
		} as any);

		expect(res.status).toBe(403);
	});

	it('GET lists attachment metadata for the owning user', async () => {
		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({
					where: () => ({
						all: async () => [{ id: 'a1', fileName: 'card.pdf' }]
					})
				})
			})
		} as any);

		const res = await GET({
			params: { id: '5' },
			locals: { appUser: { role: 'volunteer', id: 5 } }
		} as any);

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual([{ id: 'a1', fileName: 'card.pdf' }]);
	});

	it('POST rejects non-admin users', async () => {
		const res = await POST({
			params: { id: '5' },
			request: { formData: async () => new FormData() },
			locals: { appUser: { role: 'employee' } }
		} as any);

		expect(res.status).toBe(403);
	});

	it('POST rejects missing file', async () => {
		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({ where: () => ({ get: async () => ({ id: 5 }) }) })
			})
		} as any);

		const res = await POST({
			params: { id: '5' },
			request: { formData: async () => new FormData() },
			locals: { appUser: { role: 'administrator' } }
		} as any);

		expect(res.status).toBe(400);
	});

	it('POST adds a new file for admins without removing existing ones', async () => {
		const returningGetMock = vi.fn(async () => ({ id: 'a2', fileName: 'note.txt' }));
		const valuesMock = vi.fn(() => ({ returning: () => ({ get: returningGetMock }) }));
		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({ where: () => ({ get: async () => ({ id: 5 }) }) })
			}),
			insert: () => ({ values: valuesMock })
		} as any);

		const form = new FormData();
		form.set('attachment', new File(['hello'], 'note.txt', { type: 'text/plain' }));

		const res = await POST({
			params: { id: '5' },
			request: { formData: async () => form },
			locals: { appUser: { role: 'administrator' } }
		} as any);

		expect(res.status).toBe(201);
		expect(valuesMock).toHaveBeenCalledWith(
			expect.objectContaining({ userId: 5, fileName: 'note.txt', mimeType: 'text/plain' })
		);
		expect(await res.json()).toEqual({ id: 'a2', fileName: 'note.txt' });
	});
});
