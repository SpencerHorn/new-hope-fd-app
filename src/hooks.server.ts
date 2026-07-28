// src/hooks.server.ts
import { validateRequest } from '$lib/server/auth';
import { getAppUserFromSessionUser } from '$lib/server/appUser';
import { redirect } from '@sveltejs/kit';

export const handle = async ({ event, resolve }) => {
	const { user, session } = await validateRequest(event);
	const appUser = await getAppUserFromSessionUser(user);

	event.locals.user = user;
	event.locals.session = session;
	event.locals.appUser = appUser;

	const url = event.url.pathname;
	const isPublicInviteRoute = url.startsWith('/invite') || url.startsWith('/api/invite');
	const isPublicAuthRoute = url === '/login' || url === '/signup';

	if (!user && !isPublicAuthRoute && !isPublicInviteRoute) {
		throw redirect(302, '/login');
	}

	if (user && isPublicAuthRoute) {
		throw redirect(302, '/');
	}

	return resolve(event);
};
