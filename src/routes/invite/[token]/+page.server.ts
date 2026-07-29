import { fail, redirect } from '@sveltejs/kit';
import { Argon2id } from 'oslo/password';
import { and, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { getDB } from '$lib/db/client';
import { authUsers, invites } from '$lib/db/schema';
import { getLucia } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params }) => {
	const db = await getDB();
	const invite = await db
		.select()
		.from(invites)
		.where(and(eq(invites.token, params.token), eq(invites.used, 0)))
		.get();

	if (!invite) {
		throw redirect(302, '/login');
	}

	return {
		email: invite.email
	};
};

export const actions: Actions = {
	default: async ({ request, params, cookies }) => {
		const form = await request.formData();
		const password = String(form.get('password') ?? '');
		const confirm = String(form.get('confirm') ?? '');

		if (!password || !confirm) {
			return fail(400, { message: 'Password and confirmation are required.' });
		}

		if (password.length < 10) {
			return fail(400, { message: 'Password must be at least 10 characters.' });
		}

		if (password !== confirm) {
			return fail(400, { message: 'Passwords do not match.' });
		}

		const db = await getDB();
		const lucia = await getLucia();

		const invite = await db
			.select()
			.from(invites)
			.where(and(eq(invites.token, params.token), eq(invites.used, 0)))
			.get();

		if (!invite) {
			return fail(400, { message: 'Invite is invalid or already used.' });
		}

		const existing = await db.select().from(authUsers).where(eq(authUsers.email, invite.email)).get();
		if (existing) {
			await db.delete(invites).where(eq(invites.token, params.token));
			return fail(400, { message: 'An account for this email already exists. Please sign in.' });
		}

		const passwordHash = await new Argon2id().hash(password);
		const inserted = await db
			.insert(authUsers)
			.values({
				email: invite.email,
				password_hash: passwordHash,
				mustChangePassword: 0
			})
			.returning({ id: authUsers.id });

		const userId = inserted[0]?.id;
		if (!userId) {
			return fail(500, { message: 'Failed to create account.' });
		}

		await db.delete(invites).where(eq(invites.token, params.token));

		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			...sessionCookie.attributes,
			path: '/'
		});

		throw redirect(302, '/');
	}
};
