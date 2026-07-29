import { json } from '@sveltejs/kit';
import { getDB } from '$lib/db/client';
import { userChecklistItems, userChecklists } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { isAdministrator } from '$lib/auth/roles';

export const POST = async ({ request, locals }) => {
	const db = getDB();

	const { userChecklistItemId, completed } = await request.json();

	if (!userChecklistItemId || typeof completed !== 'boolean') {
		return json({ error: 'Invalid payload' }, { status: 400 });
	}

	const ownerRow = db
		.select({ userId: userChecklists.userId })
		.from(userChecklistItems)
		.innerJoin(userChecklists, eq(userChecklistItems.userChecklistId, userChecklists.id))
		.where(eq(userChecklistItems.id, userChecklistItemId))
		.get();

	if (!ownerRow) {
		return json({ error: 'Checklist item not found' }, { status: 404 });
	}

	const isAdmin = isAdministrator(locals?.appUser?.role);
	const isSelf = locals?.appUser?.id === ownerRow.userId;
	if (!isAdmin && !isSelf) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	// Update completion status
	db.update(userChecklistItems)
		.set({
			completed: completed ? 1 : 0,
			dateCompleted: completed ? new Date().toISOString() : null
		})
		.where(eq(userChecklistItems.id, userChecklistItemId))
		.run();

	return json({ success: true });
};
