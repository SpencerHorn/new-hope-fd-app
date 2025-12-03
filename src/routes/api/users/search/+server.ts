import { json } from '@sveltejs/kit';
import { db } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { like, or } from 'drizzle-orm';

export async function GET({ url }) {
	const query = url.searchParams.get('q')?.trim();

	if (!query) {
		// No search input → return empty list, not entire DB
		return json([]);
	}

	const pattern = `%${query}%`;

	// Build OR search across all text fields
	const results = await db
		.select()
		.from(users)
		.where(
			or(
				like(users.firstName, pattern),
				like(users.lastName, pattern),
				like(users.personalEmail, pattern),
				like(users.workEmail, pattern),
				like(users.phone, pattern),
				like(users.role, pattern),
				like(users.maskSize, pattern),
				like(users.tshirtSize, pattern),
				like(users.fitTestDate, pattern)
			)
		);

	return json(results);
}
