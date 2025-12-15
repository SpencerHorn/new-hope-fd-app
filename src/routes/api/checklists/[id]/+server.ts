import { json } from '@sveltejs/kit';
import { getDB } from '$lib/db/client';
import {
	checklists,
	checklistItems,
	userChecklists,
	userChecklistItems
} from '$lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import crypto from 'crypto';

export const GET = async ({ params }) => {
	const db = getDB();
	const checklistId = params.id;

	const checklist = db.select().from(checklists).where(eq(checklists.id, checklistId)).get();
	if (!checklist) return json({ error: 'Checklist not found' }, { status: 404 });

	const items = db
		.select({
			id: checklistItems.id,
			itemNumber: checklistItems.itemNumber,
			taskName: checklistItems.taskName
		})
		.from(checklistItems)
		.where(eq(checklistItems.checklistId, checklistId))
		.orderBy(checklistItems.itemNumber)
		.all();

	return json({ ...checklist, items });
};

export const PATCH = async ({ params, request }) => {
	const db = getDB();
	const checklistId = params.id;

	const { name, items } = await request.json();

	if (!name || !Array.isArray(items) || items.length === 0) {
		return json({ error: 'Invalid payload' }, { status: 400 });
	}

	// Ensure checklist exists
	const existingChecklist = db.select().from(checklists).where(eq(checklists.id, checklistId)).get();
	if (!existingChecklist) return json({ error: 'Checklist not found' }, { status: 404 });

	// Current items
	const existingItems = db
		.select({ id: checklistItems.id })
		.from(checklistItems)
		.where(eq(checklistItems.checklistId, checklistId))
		.all();

	const existingIds = new Set(existingItems.map((i) => i.id));
	const incomingIds = new Set(items.filter((i: any) => i.id).map((i: any) => i.id));

	// Update checklist name
	try {
		db.update(checklists)
			.set({ name: String(name).trim() })
			.where(eq(checklists.id, checklistId))
			.run();
	} catch (err: any) {
		if (err?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
			return json({ error: 'A checklist with this name already exists.' }, { status: 409 });
		}
		console.error(err);
		return json({ error: 'Failed to update checklist' }, { status: 500 });
	}

	// Upsert items (preserve IDs where provided)
	for (const item of items) {
		const itemNumber = Number(item.itemNumber);
		const taskName = String(item.taskName ?? '').trim();
		if (!taskName || !itemNumber) continue;

		if (item.id && existingIds.has(item.id)) {
			db.update(checklistItems)
				.set({ itemNumber, taskName })
				.where(eq(checklistItems.id, item.id))
				.run();
		} else {
			db.insert(checklistItems)
				.values({
					id: crypto.randomUUID(),
					checklistId,
					itemNumber,
					taskName
				})
				.run();
		}
	}

	// Delete removed template items
	const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
	if (toDelete.length) {
		db.delete(checklistItems)
			.where(inArray(checklistItems.id, toDelete))
			.run();
	}

	// Re-fetch current template item ids
	const currentTemplateItems = db
		.select({ id: checklistItems.id })
		.from(checklistItems)
		.where(eq(checklistItems.checklistId, checklistId))
		.all();

	const currentTemplateIds = currentTemplateItems.map((i) => i.id);
	const currentTemplateIdSet = new Set(currentTemplateIds);

	// Sync all user assignments to reflect template changes
	const assignments = db
		.select({ id: userChecklists.id })
		.from(userChecklists)
		.where(eq(userChecklists.checklistId, checklistId))
		.all();

	for (const a of assignments) {
		const existingUserItems = db
			.select({ id: userChecklistItems.id, checklistItemId: userChecklistItems.checklistItemId })
			.from(userChecklistItems)
			.where(eq(userChecklistItems.userChecklistId, a.id))
			.all();

		const userItemByTemplate = new Map(existingUserItems.map((r) => [r.checklistItemId, r.id]));

		// Add missing rows
		const missing = currentTemplateIds.filter((tid) => !userItemByTemplate.has(tid));
		if (missing.length) {
			db.insert(userChecklistItems)
				.values(
					missing.map((tid) => ({
						id: crypto.randomUUID(),
						userChecklistId: a.id,
						checklistItemId: tid,
						completed: 0,
						dateCompleted: null
					}))
				)
				.run();
		}

		// Remove rows for deleted template items
		const removeIds = existingUserItems
			.filter((r) => !currentTemplateIdSet.has(r.checklistItemId))
			.map((r) => r.id);

		if (removeIds.length) {
			db.delete(userChecklistItems)
				.where(inArray(userChecklistItems.id, removeIds))
				.run();
		}
	}

	return json({ success: true });
};

export const DELETE = async ({ params }) => {
	const db = getDB();
	const checklistId = params.id;

	// FK cascades should remove checklist_items, user_checklists, user_checklist_items
	const existing = db.select().from(checklists).where(eq(checklists.id, checklistId)).get();
	if (!existing) return json({ error: 'Checklist not found' }, { status: 404 });

	db.delete(checklists).where(eq(checklists.id, checklistId)).run();

	return json({ success: true });
};
