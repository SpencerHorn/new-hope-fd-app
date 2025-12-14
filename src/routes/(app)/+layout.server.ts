import { redirect } from '@sveltejs/kit';

export const load = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	return {
		user: locals.user
	};
};
