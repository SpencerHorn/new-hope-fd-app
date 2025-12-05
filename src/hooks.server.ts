// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { validateRequest } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const { user } = await validateRequest(event);
	event.locals.user = user;

	const PUBLIC = ['/login', '/invite'];
	const isInvite = event.url.pathname.startsWith('/invite');

	if (!user) {
		if (!PUBLIC.includes(event.url.pathname) && !isInvite) {
			throw redirect(302, '/login');
		}
	} else {
		if (event.url.pathname === '/login') {
			throw redirect(302, '/');
		}
	}

	return resolve(event);
};
