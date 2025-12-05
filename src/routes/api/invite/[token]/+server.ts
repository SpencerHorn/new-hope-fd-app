import { fail, redirect } from '@sveltejs/kit';
import { getDB } from '$lib/db/client';
import { invites, authUsers } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { lucia } from '$lib/server/auth';
import { Argon2id } from 'oslo/password';

export const POST = async ({ request }) => {
	const db = getDB();
	const form = await request.formData();

	const token = String(form.get('token'));
	const password = String(form.get('password'));
	const confirm = String(form.get('confirm'));

	if (password !== confirm) {
		return fail(400, { error: 'Passwords do not match' });
	}

	const invite = db.select().from(invites).where(eq(invites.token, token)).get();

	if (!invite || invite.used) {
		throw redirect(302, '/login');
	}

	const hashed = await new Argon2id().hash(password);

	// Create user account
	const user = db
		.insert(authUsers)
		.values({
			email: invite.email,
			hashed_password: hashed
		})
		.returning()
		.get();

	// Mark invite used
	db.update(invites).set({ used: 1 }).where(eq(invites.id, invite.id)).run();

	// Auto-login after registration
	const session = await lucia.createSession(user.id);
	const sessionCookie = lucia.createSessionCookie(session.id);

	return new Response(null, {
		status: 302,
		headers: {
			Location: '/',
			'Set-Cookie': sessionCookie.serialize()
		}
	});
};
