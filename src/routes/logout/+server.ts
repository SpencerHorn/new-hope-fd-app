// src/routes/logout/+server.ts
import { lucia } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export const POST = async ({ cookies, locals }) => {
	// If user not logged in, just redirect
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Get session cookie
	const sessionId = cookies.get('auth_session');
	if (sessionId) {
		// Invalidate session in DB
		await lucia.invalidateSession(sessionId);

		// Remove browser cookie
		cookies.set('auth_session', '', {
			path: '/',
			maxAge: 0
		});
	}

	throw redirect(302, '/login');
};
