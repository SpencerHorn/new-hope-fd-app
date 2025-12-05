// src/lib/server/auth.ts
import { Lucia } from 'lucia';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { getDB } from '$lib/db/client';
import { authUsers, authSessions } from '$lib/db/schema';

let luciaInstance: Lucia | null = null;

export async function getLucia() {
	if (luciaInstance) return luciaInstance;

	const db = await getDB();

	const adapter = new DrizzleSQLiteAdapter(db, authSessions, authUsers);

	luciaInstance = new Lucia(adapter, {
		sessionCookie: {
			attributes: {
				secure: process.env.NODE_ENV === 'production'
			}
		},
		getUserAttributes: (a) => ({
			email: a.email
		})
	});

	return luciaInstance;
}

// Helper for hooks.server.ts
export async function validateRequest(event) {
	const lucia = await getLucia();

	const sessionId = event.cookies.get('auth_session');
	if (!sessionId) return { session: null, user: null };

	const result = await lucia.validateSession(sessionId);

	if (!result.session) {
		event.cookies.set('auth_session', '', {
			path: '/',
			maxAge: 0
		});
	}

	// Refresh cookie
	if (result.session?.fresh) {
		const cookie = lucia.createSessionCookie(result.session.id);
		event.cookies.set(cookie.name, cookie.value, {
			path: '/',
			...cookie.attributes
		});
	}

	return result;
}

declare module 'lucia' {
	interface Register {
		Lucia: ReturnType<typeof Lucia>;
		UserId: number;
		DatabaseUserAttributes: { email: string };
	}
}
