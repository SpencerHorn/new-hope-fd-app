// src/routes/login/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import { getLucia } from '$lib/server/auth';
import { getDB } from '$lib/db/client';
import { authUsers } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { Argon2id } from 'oslo/password';

export const actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '');
		const password = String(form.get('password') ?? '');

		if (!email || !password) {
			return fail(400, { message: 'Missing email or password' });
		}

		const db = await getDB();

		const user = await db.select().from(authUsers).where(eq(authUsers.email, email)).get();

		if (!user) {
			return fail(400, { message: 'Invalid email or password' });
		}

		// Verify Argon2id password
		const valid = await new Argon2id().verify(user.password_hash, password);

		if (!valid) {
			return fail(400, { message: 'Invalid email or password' });
		}

		// Load lucia instance
		const lucia = await getLucia();

		// Create session
		const session = await lucia.createSession(user.id, {});

		// Create cookie for session
		const sessionCookie = lucia.createSessionCookie(session.id);

		cookies.set(sessionCookie.name, sessionCookie.value, {
			...sessionCookie.attributes,
			path: '/' // required by SvelteKit
		});

		throw redirect(302, '/');
	}
};
