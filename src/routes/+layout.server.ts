// src/routes/+layout.server.ts
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals, url }) => {
	const isPublicInviteRoute = url.pathname.startsWith('/invite');
	const isPublicAuthRoute = url.pathname === '/login' || url.pathname === '/signup';

	// Redirect unauthenticated users -> login
	if (!locals.user && !isPublicAuthRoute && !isPublicInviteRoute) {
		throw redirect(302, '/login');
	}

	return {
		user: locals.user,
		appUser: locals.appUser,
		mustChangePassword: locals.mustChangePassword ?? false
	};
};
