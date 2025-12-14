import type { PageServerLoad, Actions } from './$types';
import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { fail } from '@sveltejs/kit';
import { and, like } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url }) => {
	const db = await getDB();

	const firstName = url.searchParams.get('firstName') ?? '';
	const lastName = url.searchParams.get('lastName') ?? '';
	const phone = url.searchParams.get('phone') ?? '';
	const personalEmail = url.searchParams.get('personalEmail') ?? '';
	const role = url.searchParams.get('role') ?? '';

	const conditions = [];

	if (firstName) conditions.push(like(users.firstName, `%${firstName}%`));
	if (lastName) conditions.push(like(users.lastName, `%${lastName}%`));
	if (phone) conditions.push(like(users.phone, `%${phone}%`));
	if (personalEmail) conditions.push(like(users.personalEmail, `%${personalEmail}%`));
	if (role) conditions.push(like(users.role, role));

	const query =
		conditions.length > 0
			? db.select().from(users).where(and(...conditions))
			: db.select().from(users);

	const results = await query.all();

	return {
		users: results
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
