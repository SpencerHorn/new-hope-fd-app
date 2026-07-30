import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { getDB } from '$lib/db/client';
import { sopDocuments } from '$lib/db/schema';

export const GET = async ({ params, locals }) => {
	if (!locals.appUser) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const db = getDB();
	const id = String(params.id ?? '').trim();

	if (!id) {
		return json({ error: 'Invalid document id' }, { status: 400 });
	}

	const row = db
		.select({
			id: sopDocuments.id,
			name: sopDocuments.name,
			sopTitle: sopDocuments.sopTitle,
			sopNumber: sopDocuments.sopNumber,
			revisionDate: sopDocuments.revisionDate,
			formData: sopDocuments.formData,
			updatedAt: sopDocuments.updatedAt
		})
		.from(sopDocuments)
		.where(eq(sopDocuments.id, id))
		.get();

	if (!row) {
		return json({ error: 'SOP document not found' }, { status: 404 });
	}

	let parsed;
	try {
		parsed = JSON.parse(row.formData);
	} catch {
		return json({ error: 'Saved SOP data is invalid' }, { status: 500 });
	}

	return json({
		id: row.id,
		name: row.name,
		sopTitle: row.sopTitle,
		sopNumber: row.sopNumber,
		revisionDate: row.revisionDate,
		updatedAt: row.updatedAt,
		payload: parsed
	});
};