// src/routes/login/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import { lucia } from '$lib/server/auth';
import { authUsers } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { Argon2id } from 'oslo/password';
import { getDB } from '$lib/db/client';

export const actions = {
	default: async (event) => {
		const form = await event.request.formData();
		const email = String(form.get('email') ?? '');
		const password = String(form.get('password') ?? '');

		if (!email || !password) {
			return fail(400, { message: 'Missing email or password' });
		}

		const db = await getDB();

		const existingUser = await db.select().from(authUsers).where(eq(authUsers.email, email)).get();

		if (!existingUser) {
			return fail(400, { message: 'Invalid email or password' });
		}

		const valid = await new Argon2id().verify(existingUser.password_hash, password);

		if (!valid) {
			return fail(400, { message: 'Invalid email or password' });
		}

		// Create session
		const session = await lucia.createSession(existingUser.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);

		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			...sessionCookie.attributes,
			path: '/'
		});

		throw redirect(302, '/');
	}
};
