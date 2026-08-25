import type { PageServerLoad } from './$types';
import { getDB } from '$lib/db/client';
import { userAttachments, users } from '$lib/db/schema';
import { isAdministrator } from '$lib/auth/roles';
import { and, eq, isNull } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals }) => {
	const db = await getDB();
	const requestedUserId = Number(params.id);
	const isAdmin = isAdministrator(locals.appUser?.role);

	if (!isAdmin && locals.appUser?.id !== requestedUserId) {
		return {
			user: null,
			error: 'User not found',
			canManageUsers: false
		};
	}

	const user = await db
		.select()
		.from(users)
		.where(and(eq(users.id, requestedUserId), isNull(users.deletedAt)))
		.get();

	if (!user) {
		return {
			user: null,
			error: 'User not found',
			canManageUsers: isAdmin
		};
	}

	const attachments = await db
		.select({
			id: userAttachments.id,
			fileName: userAttachments.fileName,
			mimeType: userAttachments.mimeType,
			fileSize: userAttachments.fileSize,
			uploadedAt: userAttachments.uploadedAt
		})
		.from(userAttachments)
		.where(eq(userAttachments.userId, requestedUserId))
		.all();

	return {
		user,
		attachments,
		canManageUsers: isAdmin
	};
};
