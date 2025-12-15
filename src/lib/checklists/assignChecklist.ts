import { db } from '$lib/db';
import {
	checklists,
	checklistItems,
	userChecklists,
	userChecklistItems,
	users
} from '$lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { randomUUID } from 'crypto';

type AssignOptions = {
	checklistId: string;
	assignTo:
		| { type: 'all' }
		| { type: 'group'; roles: string[] }
		| { type: 'users'; userIds: number[] };
	assignedBy?: string;
};

export async function assignChecklist({
	checklistId,
	assignTo,
	assignedBy
}: AssignOptions) {
	return db.transaction(async (tx) => {
		// 1️⃣ Ensure checklist exists
		const [checklist] = await tx
			.select()
			.from(checklists)
			.where(eq(checklists.id, checklistId));

		if (!checklist) {
			throw new Error('Checklist not found');
		}

		// 2️⃣ Fetch checklist items
		const items = await tx
			.select()
			.from(checklistItems)
			.where(eq(checklistItems.checklistId, checklistId));

		if (items.length === 0) {
			throw new Error('Checklist has no items');
		}

		// 3️⃣ Resolve target users
		let targetUsers;

		if (assignTo.type === 'all') {
			targetUsers = await tx.select().from(users);
		} else if (assignTo.type === 'group') {
			targetUsers = await tx
				.select()
				.from(users)
				.where(inArray(users.role, assignTo.roles));
		} else {
			targetUsers = await tx
				.select()
				.from(users)
				.where(inArray(users.id, assignTo.userIds));
		}

		if (targetUsers.length === 0) {
			throw new Error('No users matched assignment criteria');
		}

		// 4️⃣ Assign checklist to each user
		for (const user of targetUsers) {
			// Prevent duplicate assignment
			const existing = await tx
				.select()
				.from(userChecklists)
				.where(
					eq(userChecklists.userId, user.id)
				)
				.where(eq(userChecklists.checklistId, checklistId));

			if (existing.length > 0) continue;

			const userChecklistId = randomUUID();

			await tx.insert(userChecklists).values({
				id: userChecklistId,
				checklistId,
				userId: user.id,
				userPhone: user.phone,
				assignedAt: new Date().toISOString()
			});

			// 5️⃣ Create checklist item states
			const itemRows = items.map((item) => ({
				id: randomUUID(),
				userChecklistId,
				checklistItemId: item.id,
				completed: 0,
				dateCompleted: null,
				completedBy: null,
				notes: null
			}));

			await tx.insert(userChecklistItems).values(itemRows);
		}

		return { success: true };
	});
}
