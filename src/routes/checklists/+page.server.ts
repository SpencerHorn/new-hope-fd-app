import { redirect } from '@sveltejs/kit';
import { isAdministrator } from '$lib/auth/roles';

export const load = async ({ locals }) => {
	if (!isAdministrator(locals.appUser?.role)) {
		throw redirect(302, '/dashboard');
	}

	return {};
};
