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
		const getMock = vi.fn(async () => ({ id: 1 }));
		const whereMock = vi.fn(async () => undefined);
		const setMock = vi.fn(() => ({ where: whereMock }));
		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({ where: () => ({ get: getMock }) })
			}),
			update: () => ({ set: setMock })
		} as any);

		const res = await DELETE({
			params: { id: '1' },
			locals: { appUser: { role: 'administrator' } }
		} as any);

		expect(res.status).toBe(204);
		expect(whereMock).toHaveBeenCalled();
		expect(setMock).toHaveBeenCalledWith(expect.objectContaining({ deletedAt: expect.any(String) }));
	});

	it('PATCH rejects non-admin users editing another profile', async () => {
		const req = new Request('http://localhost/api/users/1', {
			method: 'PATCH',
			body: JSON.stringify({ firstName: 'A' })
		});
		const res = await PATCH({
			params: { id: '1' },
			request: req,
			locals: { appUser: { role: 'volunteer', id: 2 } }
		} as any);

		expect(res.status).toBe(403);
	});

	it('PATCH allows users to update their own profile', async () => {
		const getMock = vi.fn(async () => ({ id: 3, personalEmail: 'a@b.com' }));
		const whereMock = vi.fn(async () => undefined);
		const setMock = vi.fn(() => ({ where: whereMock }));
		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({ where: () => ({ get: getMock }) })
			}),
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
			locals: { appUser: { role: 'volunteer', id: 3 } }
		} as any);

		expect(res.status).toBe(204);
		expect(setMock).toHaveBeenCalled();
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
		const getMock = vi.fn(async () => ({ id: 3, personalEmail: 'a@b.com' }));
		const whereMock = vi.fn(async () => undefined);
		const setMock = vi.fn(() => ({ where: whereMock }));
		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({ where: () => ({ get: getMock }) })
			}),
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

	it('PATCH returns 409 when personal email conflicts with another auth account', async () => {
		const getMock = vi
			.fn()
			.mockResolvedValueOnce({ id: 5, personalEmail: 'old@example.com' })
			.mockResolvedValueOnce({ id: 55 })
			.mockResolvedValueOnce({ id: 77 });

		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({ where: () => ({ get: getMock }) })
			}),
			update: () => ({ set: () => ({ where: vi.fn() }) })
		} as any);

		const req = new Request('http://localhost/api/users/5', {
			method: 'PATCH',
			body: JSON.stringify({
				firstName: 'A',
				lastName: 'B',
				personalEmail: 'new@example.com',
				phone: '(111) 222-3333'
			})
		});

		const res = await PATCH({
			params: { id: '5' },
			request: req,
			locals: { appUser: { role: 'administrator', id: 1 } }
		} as any);

		expect(res.status).toBe(409);
	});
});
