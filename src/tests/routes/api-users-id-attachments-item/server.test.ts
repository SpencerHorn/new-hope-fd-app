import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/db/client', () => ({ getDB: vi.fn() }));

import { DELETE, GET } from '../../../routes/api/users/[id]/attachments/[attachmentId]/+server';
import { getDB } from '$lib/db/client';

describe('api users/[id]/attachments/[attachmentId]', () => {
	it('GET rejects users who are not self or admin', async () => {
		const res = await GET({
			params: { id: '5', attachmentId: 'a1' },
			locals: { appUser: { role: 'volunteer', id: 1 } }
		} as any);

		expect(res.status).toBe(403);
	});

	it('GET returns the stored file for the owning user', async () => {
		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({
					where: () => ({
						get: async () => ({
							fileName: 'card.pdf',
							mimeType: 'application/pdf',
							fileSize: 3,
							fileData: Buffer.from([1, 2, 3])
						})
					})
				})
			})
		} as any);

		const res = await GET({
			params: { id: '5', attachmentId: 'a1' },
			locals: { appUser: { role: 'volunteer', id: 5 } }
		} as any);

		expect(res.status).toBe(200);
		expect(res.headers.get('Content-Type')).toBe('application/pdf');
	});

	it('GET returns 404 when the attachment does not belong to the user', async () => {
		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({
					where: () => ({ get: async () => undefined })
				})
			})
		} as any);

		const res = await GET({
			params: { id: '5', attachmentId: 'a1' },
			locals: { appUser: { role: 'administrator' } }
		} as any);

		expect(res.status).toBe(404);
	});

	it('DELETE rejects non-admin users', async () => {
		const res = await DELETE({
			params: { id: '5', attachmentId: 'a1' },
			locals: { appUser: { role: 'volunteer' } }
		} as any);

		expect(res.status).toBe(403);
	});

	it('DELETE removes the attachment for admins', async () => {
		const whereMock = vi.fn(async () => undefined);
		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({ where: () => ({ get: async () => ({ id: 'a1' }) }) })
			}),
			delete: () => ({ where: whereMock })
		} as any);

		const res = await DELETE({
			params: { id: '5', attachmentId: 'a1' },
			locals: { appUser: { role: 'administrator' } }
		} as any);

		expect(res.status).toBe(204);
		expect(whereMock).toHaveBeenCalled();
	});
});
