// src/hooks.server.ts
import { getLucia, validateRequest } from '$lib/server/auth';
import { getAppUserFromSessionUser } from '$lib/server/appUser';
import { getDB } from '$lib/db/client';
import { authUsers } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const { user, session } = await validateRequest(event);
	const appUser = await getAppUserFromSessionUser(user);
	const db = await getDB();
	const authUser =
		user && Number.isFinite(Number(user.id))
			? await db
					.select({
						id: authUsers.id,
						email: authUsers.email,
						mustChangePassword: authUsers.mustChangePassword
					})
					.from(authUsers)
					.where(eq(authUsers.id, Number(user.id)))
					.get()
			: null;

	event.locals.user = user;
	event.locals.session = session;
	event.locals.appUser = appUser;
	event.locals.authUser = authUser
		? {
				id: authUser.id,
				email: authUser.email,
				mustChangePassword: Boolean(authUser.mustChangePassword)
			}
		: null;
	event.locals.mustChangePassword = Boolean(authUser?.mustChangePassword);

	const url = event.url.pathname;
	const isPublicInviteRoute = url.startsWith('/invite') || url.startsWith('/api/invite');
	const isPublicAuthRoute = url === '/login' || url === '/signup';
	const isPublicAccountRoute = isPublicInviteRoute || isPublicAuthRoute;

	if (user && !appUser) {
		const lucia = await getLucia();
		if (session) {
			await lucia.invalidateSession(session.id);
		}

		const blankCookie = lucia.createBlankSessionCookie();
		event.cookies.set(blankCookie.name, blankCookie.value, {
			...blankCookie.attributes,
			path: '/'
		});

		if (!isPublicAccountRoute) {
			throw redirect(302, '/login');
		}
	}

	if (!user && !isPublicAuthRoute && !isPublicInviteRoute) {
		throw redirect(302, '/login');
	}

	if (user && isPublicAuthRoute) {
		throw redirect(302, '/');
	}

	if (user && event.locals.mustChangePassword) {
		const isDashboardRoute = url === '/dashboard';
		const isAllowedPasswordRoute =
			url === '/logout' ||
			url === '/api/account/password' ||
			url.startsWith('/api/checklists/items/toggle');

		if (!isDashboardRoute && !isAllowedPasswordRoute) {
			throw redirect(302, '/dashboard');
		}
	}

	return resolve(event);
};
