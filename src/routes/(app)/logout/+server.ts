// src/routes/logout/+server.ts
import { getLucia } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export const POST = async ({ locals, cookies }) => {
	const lucia = await getLucia();

	const session = locals.session;

	if (session) {
		await lucia.invalidateSession(session.id);
	}

	// Clear session cookie
	cookies.set('auth_session', '', {
		path: '/',
		maxAge: 0
	});

	throw redirect(302, '/login');
};
