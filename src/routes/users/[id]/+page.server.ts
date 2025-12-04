import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export async function load({ params }) {
	const db = getDB(); // ← IMPORTANT: get DB instance safely

	const id = Number(params.id);

	const user = db.select().from(users).where(eq(users.id, id)).get();

	if (!user) {
		return {
			status: 404,
			error: new Error('User not found')
		};
	}

	return { user };
}
