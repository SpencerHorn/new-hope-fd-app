// src/routes/+layout.server.ts
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals, url }) => {
	// Redirect unauthenticated users → login
	if (!locals.user && url.pathname !== '/login') {
		throw redirect(302, '/login');
	}

	return {
		user: locals.user,
		url
	};
};
