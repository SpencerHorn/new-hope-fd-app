// src/routes/api/users/[id]/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit';
import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/users/:id
export const GET: RequestHandler = async ({ params }) => {
	const db = getDB();
	const id = Number(params.id);

	const user = db.select().from(users).where(eq(users.id, id)).get();
	return json(user || null);
};

// PATCH /api/users/:id
export const PATCH: RequestHandler = async ({ params, request }) => {
	const db = getDB();
	const id = Number(params.id);
	const data = await request.json();

	const updated = db.update(users).set(data).where(eq(users.id, id)).returning().get();

	return json(updated);
};

// DELETE /api/users/:id
export const DELETE: RequestHandler = async ({ params }) => {
	const db = getDB();
	const id = Number(params.id);

	db.delete(users).where(eq(users.id, id)).run();

	return json({ success: true });
};
