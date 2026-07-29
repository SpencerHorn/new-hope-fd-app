import type { PageServerLoad } from './$types';
import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { isAdministrator } from '$lib/auth/roles';
import { and, eq, isNull } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals }) => {
	const db = await getDB();
	const requestedUserId = Number(params.id);
	const isAdmin = isAdministrator(locals.appUser?.role);

	if (!isAdmin && locals.appUser?.id !== requestedUserId) {
		return {
			user: null,
			error: 'User not found',
			canManageUsers: false
		};
	}

	const user = await db
		.select()
		.from(users)
		.where(and(eq(users.id, requestedUserId), isNull(users.deletedAt)))
		.get();

	if (!user) {
		return {
			user: null,
			error: 'User not found',
			canManageUsers: isAdmin
		};
	}

	return {
		user,
		canManageUsers: isAdmin
	};
};
