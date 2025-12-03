import { db } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export async function load({ params }) {
	const id = Number(params.id);

	const user = await db.select().from(users).where(eq(users.id, id)).get();

	if (!user) {
		return {
			status: 404,
			error: new Error('User not found')
		};
	}

	return { user };
}
