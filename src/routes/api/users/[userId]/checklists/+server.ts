import { json } from '@sveltejs/kit';
import { getDB } from '$lib/db/client';
import {
	userChecklists,
	checklists,
	userChecklistItems,
	checklistItems
} from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const GET = async ({ params }) => {
	const db = getDB();
	const userId = Number(params.userId);

	if (!userId) {
		return json({ error: 'Invalid user id' }, { status: 400 });
	}

	const rows = db
		.select({
			userChecklistId: userChecklists.id,
			checklistId: checklists.id,
			checklistName: checklists.name,
			itemId: checklistItems.id,
			itemNumber: checklistItems.itemNumber,
			taskName: checklistItems.taskName,
			completed: userChecklistItems.completed,
			dateCompleted: userChecklistItems.dateCompleted,
            userChecklistItemId: userChecklistItems.id,
		})
		.from(userChecklists)
		.innerJoin(
			checklists,
			eq(userChecklists.checklistId, checklists.id)
		)
		.innerJoin(
			userChecklistItems,
			eq(userChecklistItems.userChecklistId, userChecklists.id)
		)
		.innerJoin(
			checklistItems,
			eq(userChecklistItems.checklistItemId, checklistItems.id)
		)
		.where(eq(userChecklists.userId, userId))
		.orderBy(checklistItems.itemNumber)
		.all();

	// Group rows by checklist
	const grouped: Record<string, any> = {};

	for (const row of rows) {
		if (!grouped[row.userChecklistId]) {
			grouped[row.userChecklistId] = {
				userChecklistId: row.userChecklistId,
				checklistId: row.checklistId,
				name: row.checklistName,
				items: []
			};
		}

		grouped[row.userChecklistId].items.push({
            userChecklistItemId: row.userChecklistItemId,
            number: row.itemNumber,
            taskName: row.taskName,
            completed: !!row.completed,
            dateCompleted: row.dateCompleted
        });

	}

	return json(Object.values(grouped));
};
