import type { PageServerLoad } from './$types';
import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	const db = await getDB();

	const user = await db
		.select()
		.from(users)
		.where(eq(users.id, Number(params.id)))
		.get();

	if (!user) {
		return {
			user: null,
			error: 'User not found'
		};
	}

	return {
		user
	};
};
