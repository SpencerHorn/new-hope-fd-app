// src/hooks.server.ts
import { validateRequest } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export const handle = async ({ event, resolve }) => {
	const { user, session } = await validateRequest(event);

	event.locals.user = user;
	event.locals.session = session;

	const url = event.url.pathname;

	if (!user && url !== '/login' && !url.startsWith('/invite')) {
		throw redirect(302, '/login');
	}

	if (user && url === '/login') {
		throw redirect(302, '/');
	}

	return resolve(event);
};
