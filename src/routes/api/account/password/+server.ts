import { json } from '@sveltejs/kit';
import { getDB } from '$lib/db/client';
import { authUsers } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword } from '$lib/server/password';

function validateNewPassword(password: string): string | null {
	if (password.length < 10) return 'Password must be at least 10 characters.';
	return null;
}

export const POST = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { currentPassword, newPassword, confirmPassword } = await request.json();

	if (!currentPassword || !newPassword || !confirmPassword) {
		return json({ error: 'All password fields are required.' }, { status: 400 });
	}

	if (newPassword !== confirmPassword) {
		return json({ error: 'New password and confirmation do not match.' }, { status: 400 });
	}

	const validationError = validateNewPassword(String(newPassword));
	if (validationError) {
		return json({ error: validationError }, { status: 400 });
	}

	const db = await getDB();
	const authUserId = Number(locals.user.id);

	const authUser = await db.select().from(authUsers).where(eq(authUsers.id, authUserId)).get();
	if (!authUser) {
		return json({ error: 'Account not found.' }, { status: 404 });
	}

	const valid = await verifyPassword(authUser.password_hash, String(currentPassword));
	if (!valid) {
		return json({ error: 'Current password is incorrect.' }, { status: 400 });
	}

	const nextHash = await hashPassword(String(newPassword));
	await db
		.update(authUsers)
		.set({
			password_hash: nextHash,
			mustChangePassword: 0
		})
		.where(eq(authUsers.id, authUserId));

	return json({ success: true, message: 'Password updated successfully.' });
};
