// src/routes/+layout.server.ts
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals, url }) => {
	const isPublicInviteRoute = url.pathname.startsWith('/invite');

	// Redirect unauthenticated users -> login
	if (!locals.user && url.pathname !== '/login' && !isPublicInviteRoute) {
		throw redirect(302, '/login');
	}

	return {
		user: locals.user
	};
};
