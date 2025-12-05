// src/routes/api/invite/[token]/+server.ts
import { json } from '@sveltejs/kit';
import { getDB } from '$lib/db/client';
import { invites, authUsers } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { getLucia } from '$lib/server/auth';
import { Argon2id } from 'oslo/password';

export async function POST({ params, request }) {
	const db = await getDB();
	const lucia = await getLucia();

	const token = params.token;
	const { password } = await request.json();

	// find invite row
	const invite = await db.select().from(invites).where(eq(invites.token, token)).get();

	if (!invite) {
		return json({ error: 'Invalid invite token' }, { status: 400 });
	}

	// hash password
	const hashed = await new Argon2id().hash(password);

	// create user
	const result = await db
		.insert(authUsers)
		.values({
			email: invite.email,
			password_hash: hashed
		})
		.returning({ id: authUsers.id });

	const userId = result[0].id;

	// delete invite
	await db.delete(invites).where(eq(invites.token, token));

	// create session
	const session = await lucia.createSession(userId, {});
	const sessionCookie = lucia.createSessionCookie(session.id);

	return json({
		sessionCookieName: sessionCookie.name,
		sessionCookieValue: sessionCookie.value,
		sessionCookieAttributes: sessionCookie.attributes
	});
}
