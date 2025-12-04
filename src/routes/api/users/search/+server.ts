// src/routes/api/users/search/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit';
import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { like, or } from 'drizzle-orm';

// GET /api/users/search?query=John
export const GET: RequestHandler = async ({ url }) => {
	const db = getDB();
	const q = url.searchParams.get('query')?.trim();

	if (!q) return json([]);

	const pattern = `%${q}%`;

	const results = db
		.select()
		.from(users)
		.where(
			or(
				like(users.firstName, pattern),
				like(users.lastName, pattern),
				like(users.personalEmail, pattern),
				like(users.phone, pattern)
			)
		)
		.all();

	return json(results);
};
