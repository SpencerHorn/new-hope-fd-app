import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDB } from '$lib/db/client';
import { authUsers, users } from '$lib/db/schema';
import { isAdministrator } from '$lib/auth/roles';
import { and, eq, isNotNull } from 'drizzle-orm';
import { DEFAULT_ADMIN_EMAIL } from '$lib/server/adminSeed';
import { normalizePersonalEmail } from '$lib/server/user-conflicts';

export const load: PageServerLoad = async ({ locals }) => {
	if (!isAdministrator(locals.appUser?.role)) {
		throw redirect(302, '/dashboard');
	}

	const db = await getDB();
	const deletedUsers = await db
		.select()
		.from(users)
		.where(isNotNull(users.deletedAt))
		.all();

	return {
		users: deletedUsers.filter((user) => user.personalEmail !== DEFAULT_ADMIN_EMAIL),
		canManageDeletedUsers: true
	};
};

export const actions: Actions = {
	restore: async ({ request, locals }) => {
		if (!isAdministrator(locals.appUser?.role)) {
			return fail(403, { error: 'Forbidden' });
		}

		const form = await request.formData();
		const id = Number(form.get('userId'));
		if (!id) {
			return fail(400, { error: 'Invalid user id' });
		}

		const db = await getDB();
		const deletedUser = await db
			.select({ id: users.id })
			.from(users)
			.where(and(eq(users.id, id), isNotNull(users.deletedAt)))
			.get();
		if (!deletedUser) {
			return fail(404, { error: 'Deleted user not found' });
		}

		await db.update(users).set({ deletedAt: null }).where(eq(users.id, id));

		return { success: true };
	},
	purge: async ({ request, locals }) => {
		if (!isAdministrator(locals.appUser?.role)) {
			return fail(403, { error: 'Forbidden' });
		}

		const form = await request.formData();
		const id = Number(form.get('userId'));
		if (!id) {
			return fail(400, { error: 'Invalid user id' });
		}

		const db = await getDB();
		const deletedUser = await db
			.select({ id: users.id, personalEmail: users.personalEmail })
			.from(users)
			.where(and(eq(users.id, id), isNotNull(users.deletedAt)))
			.get();
		if (!deletedUser) {
			return fail(404, { error: 'Deleted user not found' });
		}

		await db.delete(users).where(eq(users.id, id));

		const email = normalizePersonalEmail(deletedUser.personalEmail);
		if (email) {
			await db.delete(authUsers).where(eq(authUsers.email, email));
		}

		return { success: true };
	}
};