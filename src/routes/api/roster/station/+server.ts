import { json } from '@sveltejs/kit';
import { db } from '$lib/db/client';
import { users, onboardingItems, userOnboardingStatus } from '$lib/db/schema';

export const GET = async () => {
	const roster = db
		.select({
			lastName: users.lastName,
			firstName: users.firstName,
			phone: users.phone,
			workEmail: users.workEmail
		})
		.from(users)
		.orderBy(users.lastName)
		.all();

	return json(roster);
};
