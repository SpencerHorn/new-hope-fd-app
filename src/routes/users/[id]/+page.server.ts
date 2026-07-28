import type { PageServerLoad } from './$types';
import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { isAdministrator } from '$lib/auth/roles';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals }) => {
	const db = await getDB();
	const requestedUserId = Number(params.id);
	const isProbationary = locals.appUser?.role === 'probationary';
	const isAdmin = isAdministrator(locals.appUser?.role);

	if (isProbationary && locals.appUser?.id !== requestedUserId) {
		return {
			user: null,
			error: 'User not found',
			canManageUsers: false
		};
	}

	const user = await db
		.select()
		.from(users)
		.where(eq(users.id, requestedUserId))
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
