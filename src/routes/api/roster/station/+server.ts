// src/routes/api/roster/station/+server.ts
import { json } from '@sveltejs/kit';
import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { ne } from 'drizzle-orm';
import { DEFAULT_ADMIN_EMAIL } from '$lib/server/adminSeed';

export const GET = async () => {
	const db = getDB();

	const roster = db
		.select({
			lastName: users.lastName,
			firstName: users.firstName,
			phone: users.phone,
			personalEmail: users.personalEmail,
			workEmail: users.workEmail,
			role: users.role
		})
		.from(users)
		.where(ne(users.personalEmail, DEFAULT_ADMIN_EMAIL))
		.orderBy(users.lastName)
		.all();

	return json(roster);
};
