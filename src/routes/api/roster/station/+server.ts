// src/routes/api/roster/station/+server.ts
import { json } from '@sveltejs/kit';
import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';

export const GET = async () => {
	const db = getDB();

	const roster = db
		.select({
			lastName: users.lastName,
			firstName: users.firstName,
			phone: users.phone,
			workEmail: users.workEmail,
			role: users.role
		})
		.from(users)
		.orderBy(users.lastName)
		.all();

	return json(roster);
};
