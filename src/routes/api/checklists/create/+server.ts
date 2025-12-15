import { json } from '@sveltejs/kit';
import { getDB } from '$lib/db/client';
import { checklists, checklistItems } from '$lib/db/schema';
import crypto from 'crypto';

export const POST = async ({ request }) => {
	const db = getDB();

	const { name, items } = await request.json();

	if (!name || !items || items.length === 0) {
		return json({ error: 'Invalid payload' }, { status: 400 });
	}

	try {
		const checklistId = crypto.randomUUID();

		db.insert(checklists)
			.values({
				id: checklistId,
				name: name.trim()
			})
			.run();

		db.insert(checklistItems)
			.values(
				items.map((item: any) => ({
					id: crypto.randomUUID(),
					checklistId,
					itemNumber: item.itemNumber,
					taskName: item.taskName
				}))
			)
			.run();

		return json({ success: true, checklistId });
	} catch (err: any) {
		// Handle unique constraint violation
		if (err?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
			return json(
				{ error: 'A checklist with this name already exists.' },
				{ status: 409 }
			);
		}

		console.error(err);
		return json({ error: 'Failed to create checklist' }, { status: 500 });
	}
};
