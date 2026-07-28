import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/db/client', () => ({ getDB: vi.fn() }));

import { GET, POST } from '../../../routes/api/users/+server';
import { getDB } from '$lib/db/client';

describe('api users', () => {
	it('GET returns all users', async () => {
		vi.mocked(getDB).mockReturnValue({
			select: () => ({
				from: () => ({ all: () => [{ id: 1, firstName: 'Jane' }] })
			})
		} as any);

		const res = await GET({} as any);
		expect(res.status).toBe(200);
		await expect(res.json()).resolves.toEqual([{ id: 1, firstName: 'Jane' }]);
	});

	it('GET returns only self for probationary users', async () => {
		const whereMock = vi.fn(() => ({ all: () => [{ id: 7, firstName: 'Self' }] }));

		vi.mocked(getDB).mockReturnValue({
			select: () => ({
				from: () => ({
					where: whereMock,
					all: () => [{ id: 1, firstName: 'Jane' }, { id: 7, firstName: 'Self' }]
				})
			})
		} as any);

		const res = await GET({ locals: { appUser: { role: 'probationary', id: 7 } } } as any);
		expect(res.status).toBe(200);
		expect(whereMock).toHaveBeenCalled();
		await expect(res.json()).resolves.toEqual([{ id: 7, firstName: 'Self' }]);
	});

	it('POST validates required fields', async () => {
		vi.mocked(getDB).mockReturnValue({} as any);
		const req = new Request('http://localhost/api/users', {
			method: 'POST',
			body: JSON.stringify({ firstName: 'A' })
		});
		const res = await POST({ request: req, locals: { appUser: { role: 'administrator' } } } as any);
		expect(res.status).toBe(400);
	});

	it('POST rejects non-admin users', async () => {
		vi.mocked(getDB).mockReturnValue({} as any);
		const req = new Request('http://localhost/api/users', {
			method: 'POST',
			body: JSON.stringify({
				firstName: 'A',
				lastName: 'B',
				personalEmail: 'a@b.com',
				phone: '(111) 222-3333'
			})
		});
		const res = await POST({ request: req, locals: { appUser: { role: 'employee' } } } as any);
		expect(res.status).toBe(403);
	});

	it('POST rejects duplicate phone', async () => {
		vi.mocked(getDB).mockReturnValue({
			select: () => ({
				from: () => ({ where: () => ({ get: () => ({ id: 99 }) }) })
			})
		} as any);

		const req = new Request('http://localhost/api/users', {
			method: 'POST',
			body: JSON.stringify({
				firstName: 'A',
				lastName: 'B',
				personalEmail: 'a@b.com',
				phone: '(111) 222-3333'
			})
		});
		const res = await POST({ request: req, locals: { appUser: { role: 'administrator' } } } as any);
		expect(res.status).toBe(400);
	});

	it('POST creates a user', async () => {
		vi.mocked(getDB).mockReturnValue({
			select: () => ({
				from: () => ({ where: () => ({ get: () => undefined }) })
			}),
			insert: () => ({
				values: () => ({
					returning: () => ({
						get: () => ({ id: 2, firstName: 'A', lastName: 'B' })
					})
				})
			})
		} as any);

		const req = new Request('http://localhost/api/users', {
			method: 'POST',
			body: JSON.stringify({
				firstName: 'A',
				lastName: 'B',
				personalEmail: 'a@b.com',
				phone: '(111) 222-3333'
			})
		});
		const res = await POST({ request: req, locals: { appUser: { role: 'administrator' } } } as any);
		expect(res.status).toBe(201);
		await expect(res.json()).resolves.toMatchObject({ id: 2 });
	});
});
