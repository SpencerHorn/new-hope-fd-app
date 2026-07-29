import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/db/client', () => ({ getDB: vi.fn() }));

import { POST } from '../../../routes/api/users/[id]/role/+server';
import { getDB } from '$lib/db/client';

describe('api users/[id]/role', () => {
	it('rejects non-admin users', async () => {
		const req = new Request('http://localhost/api/users/1/role', {
			method: 'POST',
			body: JSON.stringify({ role: 'employee' })
		});
		const res = await POST({
			params: { id: '1' },
			request: req,
			locals: { appUser: { role: 'employee' } }
		} as any);

		expect(res.status).toBe(403);
	});

	it('rejects invalid role', async () => {
		const req = new Request('http://localhost/api/users/1/role', {
			method: 'POST',
			body: JSON.stringify({ role: 'chief' })
		});
		const res = await POST({
			params: { id: '1' },
			request: req,
			locals: { appUser: { role: 'administrator' } }
		} as any);

		expect(res.status).toBe(400);
	});

	it('updates role for admin with valid role', async () => {
		const whereMock = vi.fn(async () => undefined);
		const getMock = vi.fn(async () => ({ id: 2 }));
		vi.mocked(getDB).mockResolvedValue({
			select: () => ({
				from: () => ({ where: () => ({ get: getMock }) })
			}),
			update: () => ({ set: () => ({ where: whereMock }) })
		} as any);

		const req = new Request('http://localhost/api/users/2/role', {
			method: 'POST',
			body: JSON.stringify({ role: 'volunteer' })
		});
		const res = await POST({
			params: { id: '2' },
			request: req,
			locals: { appUser: { role: 'administrator' } }
		} as any);

		expect(res.status).toBe(204);
		expect(getMock).toHaveBeenCalled();
		expect(whereMock).toHaveBeenCalled();
	});
});
