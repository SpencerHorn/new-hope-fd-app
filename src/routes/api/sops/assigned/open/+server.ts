import { json } from '@sveltejs/kit';
import { and, eq, isNull } from 'drizzle-orm';
import { getDB } from '$lib/db/client';
import { isAdministrator } from '$lib/auth/roles';
import { userSopAssignments } from '$lib/db/schema';

export const POST = async ({ request, locals }) => {
	const db = getDB();
	const { userSopAssignmentId } = (await request.json()) as { userSopAssignmentId?: string };

	if (!userSopAssignmentId) {
		return json({ error: 'Invalid payload' }, { status: 400 });
	}

	const existing = db
		.select({
			id: userSopAssignments.id,
			userId: userSopAssignments.userId,
			completedAt: userSopAssignments.completedAt
		})
		.from(userSopAssignments)
		.where(eq(userSopAssignments.id, userSopAssignmentId))
		.get();

	if (!existing) {
		return json({ error: 'SOP assignment not found' }, { status: 404 });
	}

	const isAdmin = isAdministrator(locals?.appUser?.role);
	const isSelf = locals?.appUser?.id === existing.userId;
	if (!isAdmin && !isSelf) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	if (!existing.completedAt) {
		const completedAt = new Date().toISOString();
		db.update(userSopAssignments)
			.set({ completedAt })
			.where(and(eq(userSopAssignments.id, userSopAssignmentId), isNull(userSopAssignments.completedAt)))
			.run();

		return json({ success: true, completedAt });
	}

	return json({ success: true, completedAt: existing.completedAt });
};