import { json } from '@sveltejs/kit';
import { getDB } from '$lib/db/client';
import { authUsers, users } from '$lib/db/schema';
import { isAdministrator } from '$lib/auth/roles';
import { and, eq, isNull } from 'drizzle-orm';
import { hashPassword } from '$lib/server/password';
import { generateTemporaryPassword } from '$lib/server/tempPassword';

export const POST = async ({ params, request, locals }) => {
	if (!isAdministrator(locals.appUser?.role)) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	const userId = Number(params.id);
	if (!userId) {
		return json({ error: 'Invalid user id' }, { status: 400 });
	}

	const body = await request.json().catch(() => ({}));
	const customTempPassword = typeof body?.temporaryPassword === 'string' ? body.temporaryPassword.trim() : '';
	const temporaryPassword = customTempPassword || generateTemporaryPassword();

	if (temporaryPassword.length < 10) {
		return json({ error: 'Temporary password must be at least 10 characters.' }, { status: 400 });
	}

	const db = await getDB();
	const profile = await db
		.select()
		.from(users)
		.where(and(eq(users.id, userId), isNull(users.deletedAt)))
		.get();
	if (!profile) {
		return json({ error: 'User not found' }, { status: 404 });
	}

	const normalizedEmail = String(profile.personalEmail ?? '').trim().toLowerCase();
	if (!normalizedEmail) {
		return json({ error: 'User is missing a personal email.' }, { status: 400 });
	}

	const passwordHash = await hashPassword(temporaryPassword);
	const existingAuth = await db.select().from(authUsers).where(eq(authUsers.email, normalizedEmail)).get();

	if (existingAuth) {
		await db
			.update(authUsers)
			.set({
				email: normalizedEmail,
				password_hash: passwordHash,
				mustChangePassword: 1
			})
			.where(eq(authUsers.id, existingAuth.id));
	} else {
		await db.insert(authUsers).values({
			email: normalizedEmail,
			password_hash: passwordHash,
			mustChangePassword: 1
		});
	}

	return json({
		success: true,
		temporaryPassword,
		message: 'Temporary password set. User will be prompted to change it on next login.'
	});
};
