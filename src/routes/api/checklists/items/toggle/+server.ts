import { json } from '@sveltejs/kit';
import { getDB } from '$lib/db/client';
import { userChecklistItems } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const POST = async ({ request }) => {
	const db = getDB();

	const { userChecklistItemId, completed } = await request.json();

	if (!userChecklistItemId || typeof completed !== 'boolean') {
		return json({ error: 'Invalid payload' }, { status: 400 });
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
