// src/routes/login/+server.ts
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

		const valid = await new Argon2id().verify(user.password_hash, password);

		if (!valid) {
			return fail(400, { message: 'Invalid email or password' });
		}

		const lucia = await getLucia();

		const session = await lucia.createSession(user.id, {});
		const cookie = lucia.createSessionCookie(session.id);

		cookies.set(cookie.name, cookie.value, cookie.attributes);

		throw redirect(302, '/');
	}
};
