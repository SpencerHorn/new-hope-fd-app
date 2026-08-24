// src/routes/api/roster/management/+server.ts
import { json } from '@sveltejs/kit';
import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { and, inArray, isNull } from 'drizzle-orm';

export const GET = async () => {
	const db = getDB();

	const roster = db
		.select({
			lastName: users.lastName,
			firstName: users.firstName,
			phone: users.phone,
			personalEmail: users.personalEmail,
			role: users.role
		})
		.from(users)
		.where(and(inArray(users.role, ['volunteer', 'employee']), isNull(users.deletedAt)))
		.orderBy(users.lastName)
		.all();

	return json(roster);
};
