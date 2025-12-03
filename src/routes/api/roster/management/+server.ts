import { json } from '@sveltejs/kit';
import { db } from '$lib/db/client';
import { users, onboardingItems, userOnboardingStatus } from '$lib/db/schema';
import { inArray } from 'drizzle-orm';

export const GET = async () => {
	const roster = db
		.select({
			lastName: users.lastName,
			firstName: users.firstName,
			phone: users.phone,
			personalEmail: users.personalEmail
		})
		.from(users)
		.where(inArray(users.role, ['volunteer', 'employee']))
		.orderBy(users.lastName)
		.all();

	return json(roster);
};
