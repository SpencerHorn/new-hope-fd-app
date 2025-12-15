import { json } from '@sveltejs/kit';
import { getDB } from '$lib/db/client';
import { userChecklists, users } from '$lib/db/schema';
import { eq, inArray } from 'drizzle-orm';

export const POST = async ({ request }) => {
	const db = getDB();
	const { checklistId, unassignFrom } = await request.json();

	if (!checklistId || !unassignFrom?.type) {
		return json({ error: 'Invalid payload' }, { status: 400 });
	}

	let targetUserIds: number[] = [];

	// Resolve users
	if (unassignFrom.type === 'all') {
		const rows = db.select({ id: users.id }).from(users).all();
		targetUserIds = rows.map((u) => u.id);
	}

	if (unassignFrom.type === 'group') {
		if (!unassignFrom.roles?.length) {
			return json({ error: 'No roles provided' }, { status: 400 });
		}

		const rows = db
			.select({ id: users.id })
			.from(users)
			.where(inArray(users.role, unassignFrom.roles))
			.all();

		targetUserIds = rows.map((u) => u.id);
	}

	if (unassignFrom.type === 'users') {
		if (!unassignFrom.userIds?.length) {
			return json({ error: 'No users provided' }, { status: 400 });
		}

		targetUserIds = unassignFrom.userIds;
	}

	if (targetUserIds.length === 0) {
		return json({ error: 'No users matched' }, { status: 400 });
	}

	// Delete assignments (items cascade automatically)
	db.delete(userChecklists)
		.where(eq(userChecklists.checklistId, checklistId))
		.where(inArray(userChecklists.userId, targetUserIds))
		.run();

	return json({ success: true });
};
