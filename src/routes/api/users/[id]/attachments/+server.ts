import { getDB } from '$lib/db/client';
import { userAttachments, users } from '$lib/db/schema';
import { isAdministrator } from '$lib/auth/roles';
import { addUserAttachment } from '$lib/server/userAttachments';
import { eq } from 'drizzle-orm';

// GET /api/users/[id]/attachments - list attachment metadata (no file bytes)
export async function GET({ params, locals }) {
	const userId = Number(params.id);
	if (!userId) {
		return new Response('Invalid user id', { status: 400 });
	}

	const isAdmin = isAdministrator(locals?.appUser?.role);
	const isSelf = locals?.appUser?.id === userId;
	if (!isAdmin && !isSelf) {
		return new Response('Forbidden', { status: 403 });
	}

	const db = await getDB();
	const attachments = await db
		.select({
			id: userAttachments.id,
			fileName: userAttachments.fileName,
			mimeType: userAttachments.mimeType,
			fileSize: userAttachments.fileSize,
			uploadedAt: userAttachments.uploadedAt
		})
		.from(userAttachments)
		.where(eq(userAttachments.userId, userId))
		.all();

	return new Response(JSON.stringify(attachments), {
		headers: { 'Content-Type': 'application/json' }
	});
}

// POST /api/users/[id]/attachments - add a new file for the user (does not replace existing files)
export async function POST({ params, request, locals }) {
	if (!isAdministrator(locals?.appUser?.role)) {
		return new Response('Forbidden', { status: 403 });
	}

	const userId = Number(params.id);
	if (!userId) {
		return new Response('Invalid user id', { status: 400 });
	}

	const db = await getDB();
	const existingProfile = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).get();
	if (!existingProfile) {
		return new Response('User not found', { status: 404 });
	}

	const form = await request.formData();
	const file = form.get('attachment');
	if (!(file instanceof File) || file.size === 0) {
		return new Response('A file is required', { status: 400 });
	}

	const attachment = await addUserAttachment(db, userId, file);

	return new Response(JSON.stringify(attachment), {
		status: 201,
		headers: { 'Content-Type': 'application/json' }
	});
}
