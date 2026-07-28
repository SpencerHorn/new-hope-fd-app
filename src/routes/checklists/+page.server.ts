import { redirect } from '@sveltejs/kit';
import { canViewChecklists } from '$lib/auth/roles';

export const load = async ({ locals }) => {
	if (!canViewChecklists(locals.appUser?.role)) {
		throw redirect(302, '/dashboard');
	}

	return {};
};
