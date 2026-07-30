import { json } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { getDB } from '$lib/db/client';
import { isAdministrator } from '$lib/auth/roles';
import { sopAssignments, userSopAssignments } from '$lib/db/schema';

export const GET = async ({ params, locals }) => {
	const db = getDB();
	const userId = Number(params.userId);

	if (!userId) {
		return json({ error: 'Invalid user id' }, { status: 400 });
	}

	const isAdmin = isAdministrator(locals?.appUser?.role);
	if (!isAdmin && locals?.appUser?.id !== userId) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	const rows = db
		.select({
			userSopAssignmentId: userSopAssignments.id,
			sopDocumentId: sopAssignments.sopDocumentId,
			sopTitle: sopAssignments.sopTitle,
			sopNumber: sopAssignments.sopNumber,
			revisionDate: sopAssignments.revisionDate,
			assignedAt: userSopAssignments.assignedAt,
			completedAt: userSopAssignments.completedAt
		})
		.from(userSopAssignments)
		.innerJoin(sopAssignments, eq(userSopAssignments.sopAssignmentId, sopAssignments.id))
		.where(eq(userSopAssignments.userId, userId))
		.orderBy(desc(userSopAssignments.assignedAt))
		.all();

	return json(
		rows.map((row) => ({
			...row,
			status: row.completedAt ? 'completed' : 'pending'
		}))
	);
};