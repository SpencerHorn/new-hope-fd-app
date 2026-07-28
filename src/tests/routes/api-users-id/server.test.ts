import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/db/client', () => ({ getDB: vi.fn() }));

import { DELETE, PATCH } from '../../../routes/api/users/[id]/+server';
import { getDB } from '$lib/db/client';

describe('api users/[id]', () => {
	it('DELETE rejects non-admin users', async () => {
		const res = await DELETE({
			params: { id: '1' },
			locals: { appUser: { role: 'employee' } }
		} as any);

		expect(res.status).toBe(403);
	});

	it('DELETE allows admin users', async () => {
		const whereMock = vi.fn(async () => undefined);
		vi.mocked(getDB).mockResolvedValue({
			delete: () => ({ where: whereMock })
		} as any);

		const res = await DELETE({
			params: { id: '1' },
			locals: { appUser: { role: 'administrator' } }
		} as any);

		expect(res.status).toBe(204);
		expect(whereMock).toHaveBeenCalled();
	});

	it('PATCH rejects non-admin users', async () => {
		const req = new Request('http://localhost/api/users/1', {
			method: 'PATCH',
			body: JSON.stringify({ firstName: 'A' })
		});
		const res = await PATCH({
			params: { id: '1' },
			request: req,
			locals: { appUser: { role: 'volunteer' } }
		} as any);

		expect(res.status).toBe(403);
	});

	it('PATCH validates id', async () => {
		const req = new Request('http://localhost/api/users/not-a-number', {
			method: 'PATCH',
			body: JSON.stringify({ firstName: 'A' })
		});
		const res = await PATCH({
			params: { id: 'not-a-number' },
			request: req,
			locals: { appUser: { role: 'administrator' } }
		} as any);

		expect(res.status).toBe(400);
	});

	it('PATCH allows admin updates', async () => {
		const whereMock = vi.fn(async () => undefined);
		const setMock = vi.fn(() => ({ where: whereMock }));
		vi.mocked(getDB).mockResolvedValue({
			update: () => ({ set: setMock })
		} as any);

		const req = new Request('http://localhost/api/users/3', {
			method: 'PATCH',
			body: JSON.stringify({
				firstName: 'A',
				lastName: 'B',
				personalEmail: 'a@b.com',
				phone: '(111) 222-3333'
			})
		});
		const res = await PATCH({
			params: { id: '3' },
			request: req,
			locals: { appUser: { role: 'administrator' } }
		} as any);

		expect(res.status).toBe(204);
		expect(setMock).toHaveBeenCalledWith(
			expect.objectContaining({
				firstName: 'A',
				lastName: 'B',
				personalEmail: 'a@b.com'
			})
		);
	});
});
