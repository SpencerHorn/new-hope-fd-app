// src/routes/api/users/delete/[id]/+server.ts
import { json } from '@sveltejs/kit';
import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const DELETE = async ({ params }) => {
	const db = getDB();
	const id = Number(params.id);

	await db.delete(users).where(eq(users.id, id));

	return json({ success: true });
};
