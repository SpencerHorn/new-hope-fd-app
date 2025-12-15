import { json } from '@sveltejs/kit';
import { getDB } from '$lib/db/client';
import { users, userChecklists } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const GET = async ({ params }) => {
	const db = getDB();
	const checklistId = params.id;

	if (!checklistId) {
		return json({ error: 'Invalid checklist id' }, { status: 400 });
	}

	const rows = db
		.select({
			id: users.id,
			firstName: users.firstName,
			lastName: users.lastName
		})
		.from(userChecklists)
		.innerJoin(users, eq(userChecklists.userId, users.id))
		.where(eq(userChecklists.checklistId, checklistId))
		.orderBy(users.lastName)
		.all();

	return json(rows);
};
