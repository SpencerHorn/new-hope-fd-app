import { fail, redirect } from '@sveltejs/kit';
import { getDB } from '$lib/db/client';
import { authUsers } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { lucia } from '$lib/server/auth';
import { Argon2id } from 'oslo/password';

export const actions = {
	default: async ({ request, cookies }) => {
		const db = getDB();

		const form = await request.formData();
		const email = String(form.get('email')).toLowerCase();
		const password = String(form.get('password'));

		if (!email || !password) {
			return fail(400, { message: 'Missing credentials' });
		}

		const user = await db.select().from(authUsers).where(eq(authUsers.email, email)).get();

		if (!user) {
			return fail(400, { message: 'Invalid email or password' });
		}

		const valid = await new Argon2id().verify(user.hashedPassword, password);

		if (!valid) {
			return fail(400, { message: 'Invalid email or password' });
		}

		// Create a new session
		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);

		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: sessionCookie.attributes.path,
			httpOnly: true,
			secure: sessionCookie.attributes.secure,
			sameSite: sessionCookie.attributes.sameSite,
			maxAge: sessionCookie.attributes.maxAge
		});

		throw redirect(302, '/');
	}
};
