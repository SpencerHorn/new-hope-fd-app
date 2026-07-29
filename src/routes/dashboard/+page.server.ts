import type { PageServerLoad } from './$types';
import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { and, eq, isNull } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	const currentUserId = locals.appUser?.id;
	const mustChangePassword = locals.mustChangePassword ?? false;

	if (!currentUserId) {
		return {
			user: null,
			error: 'User not found',
			mustChangePassword
		};
	}

	const db = await getDB();
	const user = await db
		.select()
		.from(users)
		.where(and(eq(users.id, currentUserId), isNull(users.deletedAt)))
		.get();

	if (!user) {
		return {
			user: null,
			error: 'User not found',
			mustChangePassword
		};
	}

	return {
		user,
		error: null,
		mustChangePassword
	};
};