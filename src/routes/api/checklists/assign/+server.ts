import { json } from '@sveltejs/kit';
import { getDB } from '$lib/db/client';
import {
	checklists,
	checklistItems,
	userChecklists,
	userChecklistItems,
	users
} from '$lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import crypto from 'crypto';

export const POST = async ({ request }) => {
	const db = getDB();

	const { checklistId, assignTo } = await request.json();

	if (!checklistId || !assignTo) {
		return json({ error: 'Invalid payload' }, { status: 400 });
	}

	// Ensure checklist exists
	const checklist = db
		.select()
		.from(checklists)
		.where(eq(checklists.id, checklistId))
		.get();

	if (!checklist) {
		return json({ error: 'Checklist not found' }, { status: 404 });
	}

	// Fetch checklist items
	const items = db
		.select()
		.from(checklistItems)
		.where(eq(checklistItems.checklistId, checklistId))
		.all();

	if (items.length === 0) {
		return json({ error: 'Checklist has no items' }, { status: 400 });
	}

	// Resolve users to assign
	let targetUsers: any[] = [];

	if (assignTo.type === 'all') {
		targetUsers = db.select().from(users).all();
	}

	if (assignTo.type === 'group') {
		if (!assignTo.roles?.length) {
			return json({ error: 'No roles selected' }, { status: 400 });
		}

		targetUsers = db
			.select()
			.from(users)
			.where(inArray(users.role, assignTo.roles))
			.all();
	}

	if (assignTo.type === 'users') {
		if (!assignTo.userIds?.length) {
			return json({ error: 'No users selected' }, { status: 400 });
		}

		targetUsers = db
			.select()
			.from(users)
			.where(inArray(users.id, assignTo.userIds))
			.all();
	}

	if (targetUsers.length === 0) {
		return json({ error: 'No users matched assignment criteria' }, { status: 400 });
	}

	// Assign checklist to each user
	for (const user of targetUsers) {
		// Prevent duplicate assignment
		const existing = db
			.select()
			.from(userChecklists)
			.where(eq(userChecklists.userId, user.id))
			.where(eq(userChecklists.checklistId, checklistId))
			.get();

		if (existing) continue;

		const userChecklistId = crypto.randomUUID();

		db.insert(userChecklists)
			.values({
				id: userChecklistId,
				checklistId,
				userId: user.id,
				userPhone: user.phone
			})
			.run();

		db.insert(userChecklistItems)
			.values(
				items.map((item) => ({
					id: crypto.randomUUID(),
					userChecklistId,
					checklistItemId: item.id,
					completed: 0,
					dateCompleted: null
				}))
			)
			.run();
	}

	return json({ success: true });
};
