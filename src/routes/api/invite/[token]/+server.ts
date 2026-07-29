// src/routes/api/invite/[token]/+server.ts
import { json } from '@sveltejs/kit';
import { getDB } from '$lib/db/client';
import { invites, authUsers } from '$lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { getLucia } from '$lib/server/auth';
import { Argon2id } from 'oslo/password';
import { findExistingUserByEmail, normalizePersonalEmail } from '$lib/server/user-conflicts';

export async function POST({ params, request, cookies }) {
	const db = await getDB();
	const lucia = await getLucia();

	const token = params.token;
	const { password } = await request.json();
	if (!password || String(password).length < 10) {
		return json({ error: 'Password must be at least 10 characters.' }, { status: 400 });
	}

	// find invite row
	const invite = await db
		.select()
		.from(invites)
		.where(and(eq(invites.token, token), eq(invites.used, 0)))
		.get();

	if (!invite) {
		return json({ error: 'Invalid invite token' }, { status: 400 });
	}

	const inviteEmail = normalizePersonalEmail(invite.email);
	const existingProfile = await findExistingUserByEmail(db, inviteEmail);
	if (existingProfile) {
		await db.delete(invites).where(eq(invites.token, token));
		return json({ error: 'A member profile for this email already exists.' }, { status: 400 });
	}

	const existing = await db.select().from(authUsers).where(eq(authUsers.email, inviteEmail)).get();
	if (existing) {
		await db.delete(invites).where(eq(invites.token, token));
		return json({ error: 'An account for this email already exists.' }, { status: 400 });
	}

	// hash password
	const hashed = await new Argon2id().hash(password);

	// create user
	const result = await db
		.insert(authUsers)
		.values({
			email: inviteEmail,
			password_hash: hashed,
			mustChangePassword: 0
		})
		.returning({ id: authUsers.id });

	const userId = result[0].id;

	// delete invite
	await db.delete(invites).where(eq(invites.token, token));

	// create session
	const session = await lucia.createSession(userId, {});
	const sessionCookie = lucia.createSessionCookie(session.id);
	cookies.set(sessionCookie.name, sessionCookie.value, {
		...sessionCookie.attributes,
		path: '/'
	});

	return json({
		success: true
	});
}
