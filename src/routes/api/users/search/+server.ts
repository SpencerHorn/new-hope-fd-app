// src/routes/api/users/search/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit';
import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { and, eq, isNull, like, ne, or } from 'drizzle-orm';
import { DEFAULT_ADMIN_EMAIL } from '$lib/server/adminSeed';

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
		like(users.workEmail, pattern),
		like(users.phone, pattern)
	);

	const results =
		locals?.appUser?.role === 'probationary' && locals?.appUser?.id
			? db
				.select()
				.from(users)
				.where(
					and(
						baseMatch,
						eq(users.id, locals.appUser.id),
						ne(users.personalEmail, DEFAULT_ADMIN_EMAIL),
						isNull(users.deletedAt)
					)
				)
				.all()
			: db
				.select()
				.from(users)
				.where(and(baseMatch, ne(users.personalEmail, DEFAULT_ADMIN_EMAIL), isNull(users.deletedAt)))
				.all();

	return json(results);
};
