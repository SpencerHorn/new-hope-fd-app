import type { PageServerLoad } from './$types';
import { isAdministrator } from '$lib/auth/roles';

export const load: PageServerLoad = async ({ locals, url }) => {
	return {
		isAdmin: isAdministrator(locals.appUser?.role),
		documentId: url.searchParams.get('documentId') ?? ''
	};
};