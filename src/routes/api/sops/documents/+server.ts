import { json } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { getDB } from '$lib/db/client';
import { isAdministrator } from '$lib/auth/roles';
import { sopDocuments } from '$lib/db/schema';
import { randomUUID } from 'crypto';

type SavedSopPayload = {
	syncValues?: Record<string, string>;
	editableBlocks?: string[];
	lineInputs?: string[];
	logoSrc?: string;
};

export const GET = async ({ locals }) => {
	if (!locals.appUser) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const db = getDB();
	const rows = db
		.select({
			id: sopDocuments.id,
			name: sopDocuments.name,
			sopTitle: sopDocuments.sopTitle,
			sopNumber: sopDocuments.sopNumber,
			revisionDate: sopDocuments.revisionDate,
			updatedAt: sopDocuments.updatedAt
		})
		.from(sopDocuments)
		.orderBy(desc(sopDocuments.updatedAt))
		.all();

	return json(rows);
};

export const POST = async ({ request, locals }) => {
	if (!isAdministrator(locals.appUser?.role)) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	const db = getDB();
	const { name, payload } = (await request.json()) as {
		name?: string;
		payload?: SavedSopPayload;
	};

	const normalizedName = String(name ?? '').trim();
	if (!normalizedName) {
		return json({ error: 'SOP name is required' }, { status: 400 });
	}

	const syncValues = payload?.syncValues ?? {};
	const sopTitle = String(syncValues.sopTitle ?? '').trim();
	const sopNumber = String(syncValues.sopNumber ?? '').trim();
	const revisionDate = String(syncValues.revisionDate ?? '').trim();

	if (!sopTitle || !sopNumber || !revisionDate) {
		return json(
			{ error: 'SOP title, number, and revision date are required before saving.' },
			{ status: 400 }
		);
	}

	const serializedPayload = JSON.stringify({
		syncValues,
		editableBlocks: payload?.editableBlocks ?? [],
		lineInputs: payload?.lineInputs ?? [],
		logoSrc: payload?.logoSrc ?? null
	});

	const existing = db
		.select({ id: sopDocuments.id })
		.from(sopDocuments)
		.where(eq(sopDocuments.name, normalizedName))
		.get();

	const now = new Date().toISOString();

	if (existing) {
		db.update(sopDocuments)
			.set({
				sopTitle,
				sopNumber,
				revisionDate,
				formData: serializedPayload,
				updatedAt: now,
				createdByUserId: locals.appUser?.id ?? null
			})
			.where(eq(sopDocuments.id, existing.id))
			.run();

		return json({ success: true, id: existing.id, updated: true });
	}

	const id = randomUUID();
	db.insert(sopDocuments)
		.values({
			id,
			name: normalizedName,
			sopTitle,
			sopNumber,
			revisionDate,
			formData: serializedPayload,
			createdByUserId: locals.appUser?.id ?? null,
			createdAt: now,
			updatedAt: now
		})
		.run();

	return json({ success: true, id, created: true });
};