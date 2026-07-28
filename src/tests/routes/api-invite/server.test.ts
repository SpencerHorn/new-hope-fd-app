import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/db/client', () => ({ getDB: vi.fn() }));

import { POST } from '../../../routes/api/invite/+server';
import { getDB } from '$lib/db/client';

describe('api invite create', () => {
	it('returns 401 when unauthenticated', async () => {
		const req = new Request('http://localhost/api/invite', {
			method: 'POST',
			body: JSON.stringify({ email: 'a@b.com' })
		});
		const res = await POST({ request: req, locals: { user: null } } as any);
		expect(res.status).toBe(401);
	});

	it('returns 400 when email missing', async () => {
		vi.mocked(getDB).mockReturnValue({ insert: vi.fn() } as any);
		const req = new Request('http://localhost/api/invite', { method: 'POST', body: JSON.stringify({}) });
		const res = await POST({ request: req, locals: { user: { id: 1 } } } as any);
		expect(res.status).toBe(400);
	});

	it('creates invite and returns URL', async () => {
		const insertRun = vi.fn();
		vi.mocked(getDB).mockReturnValue({
			insert: () => ({
				values: async () => insertRun()
			})
		} as any);

		const req = new Request('http://localhost/api/invite', {
			method: 'POST',
			body: JSON.stringify({ email: 'new.member@example.com' })
		});
		const res = await POST({ request: req, locals: { user: { id: 1 } } } as any);
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.inviteUrl).toMatch(/^\/invite\//);
	});
});
