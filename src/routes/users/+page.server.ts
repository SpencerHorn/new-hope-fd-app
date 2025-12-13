import type { PageServerLoad, Actions } from './$types';
import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const db = await getDB();
	const allUsers = await db.select().from(users).all();

	return {
		users: allUsers
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const form = await request.formData();

		const firstName = String(form.get('firstName') ?? '');
		const lastName = String(form.get('lastName') ?? '');
		const phone = String(form.get('phone') ?? '');
		const personalEmail = String(form.get('personalEmail') ?? '');
		const role = String(form.get('role') ?? 'probationary');

		if (!firstName || !lastName || !personalEmail) {
			return fail(400, { error: 'Missing required fields' });
		}

		const db = await getDB();

		await db.insert(users).values({
			firstName,
			lastName,
			phone,
			personalEmail,
			role
		});

		return { success: true };
	}
};
