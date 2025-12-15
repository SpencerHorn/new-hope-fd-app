import { json } from '@sveltejs/kit';
import { getDB } from '$lib/db/client';
import { checklists, checklistItems, userChecklists } from '$lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export const GET = async () => {
	const db = getDB();

	const rows = db
		.select({
			id: checklists.id,
			name: checklists.name,
			itemCount: sql<number>`count(distinct ${checklistItems.id})`,
			assignedCount: sql<number>`count(distinct ${userChecklists.id})`,
			createdAt: checklists.createdAt
		})
		.from(checklists)
		.leftJoin(checklistItems, eq(checklistItems.checklistId, checklists.id))
		.leftJoin(userChecklists, eq(userChecklists.checklistId, checklists.id))
		.groupBy(checklists.id)
		.orderBy(checklists.name)
		.all();

	return json(rows);
};
