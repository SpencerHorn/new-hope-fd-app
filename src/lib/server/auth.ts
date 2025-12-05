// src/lib/server/auth.ts
import type { RequestEvent } from '@sveltejs/kit';
import { Lucia } from 'lucia';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { getDB } from '$lib/db/client';
import { authUsers, authSessions } from '$lib/db/schema';

const db = await getDB();
const adapter = new DrizzleSQLiteAdapter(db, authSessions, authUsers);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: process.env.NODE_ENV === 'production'
		}
	},
	getUserAttributes: (attributes) => ({
		email: attributes.email
	})
});

export async function validateRequest(event: RequestEvent) {
	const sessionId = event.cookies.get('auth_session');

	if (!sessionId) {
		return { user: null, session: null };
	}

	const { session, user } = await lucia.validateSession(sessionId);

	// If invalid session → clear cookie
	if (!session) {
		event.cookies.set('auth_session', '', {
			path: '/',
			maxAge: 0
		});
		return { user: null, session: null };
	}

	// If fresh session → refresh cookie
	if (session.fresh) {
		const cookie = lucia.createSessionCookie(session.id);
		event.cookies.set(cookie.name, cookie.value, {
			...cookie.attributes,
			path: cookie.attributes.path ?? '/'
		});
	}

	return { user, session };
}

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		UserId: number;
		DatabaseUserAttributes: {
			email: string;
		};
	}
}
