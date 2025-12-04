// src/routes/api/elevate/[id]/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit';
import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

// PATCH /api/elevate/:id
export const PATCH: RequestHandler = async ({ params, request }) => {
	const db = getDB();
	const id = Number(params.id);
	const { role } = await request.json();

	if (!['probationary', 'volunteer', 'employee'].includes(role)) {
		return json({ message: 'Invalid role' }, { status: 400 });
	}

	const updated = db.update(users).set({ role }).where(eq(users.id, id)).returning().get();

	return json(updated);
};
