import { Lucia } from 'lucia';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-sqlite';
import { getDB } from '$lib/db/client'; // ✅ use getDB() instead of importing db directly
import { authUsers, authSessions } from '$lib/db/schema';

const db = getDB(); // ✅ get the runtime-safe DB instance

export const lucia = new Lucia(new DrizzleSQLiteAdapter(db, authSessions, authUsers), {
	sessionCookie: {
		attributes: {
			secure: process.env.NODE_ENV === 'production'
		}
	}
});

// Type augmentations for Lucia
declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		UserId: string;
	}
}
