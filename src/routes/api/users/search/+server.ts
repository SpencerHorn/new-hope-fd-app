// src/routes/api/users/search/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit';
import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { and, eq, like, or } from 'drizzle-orm';

// GET /api/users/search?query=John
export const GET: RequestHandler = async ({ url, locals }) => {
	const db = await getDB();
	const q = url.searchParams.get('query')?.trim();

	if (!q) return json([]);

	const pattern = `%${q}%`;

	const baseMatch = or(
		like(users.firstName, pattern),
		like(users.lastName, pattern),
		like(users.personalEmail, pattern),
		like(users.phone, pattern)
	);

	const results =
		locals?.appUser?.role === 'probationary' && locals?.appUser?.id
			? db
				.select()
				.from(users)
				.where(and(baseMatch, eq(users.id, locals.appUser.id)))
				.all()
			: db.select().from(users).where(baseMatch).all();

	return json(results);
};
