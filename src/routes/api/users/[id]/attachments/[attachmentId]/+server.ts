import { getDB } from '$lib/db/client';
import { userAttachments } from '$lib/db/schema';
import { isAdministrator } from '$lib/auth/roles';
import { and, eq } from 'drizzle-orm';

// GET /api/users/[id]/attachments/[attachmentId] - download a specific file
export async function GET({ params, locals }) {
	const userId = Number(params.id);
	if (!userId || !params.attachmentId) {
		return new Response('Invalid request', { status: 400 });
	}

	const isAdmin = isAdministrator(locals?.appUser?.role);
	const isSelf = locals?.appUser?.id === userId;
	if (!isAdmin && !isSelf) {
		return new Response('Forbidden', { status: 403 });
	}

	const db = await getDB();
	const attachment = await db
		.select()
		.from(userAttachments)
		.where(and(eq(userAttachments.id, params.attachmentId), eq(userAttachments.userId, userId)))
		.get();

	if (!attachment) {
		return new Response('Attachment not found', { status: 404 });
	}

	const fileBytes = new Uint8Array(attachment.fileData as Buffer);
	return new Response(fileBytes, {
		headers: {
			'Content-Type': attachment.mimeType,
			'Content-Disposition': `inline; filename="${attachment.fileName}"`,
			'Content-Length': String(attachment.fileSize)
		}
	});
}

// DELETE /api/users/[id]/attachments/[attachmentId] - remove a specific file
export async function DELETE({ params, locals }) {
	if (!isAdministrator(locals?.appUser?.role)) {
		return new Response('Forbidden', { status: 403 });
	}

	const userId = Number(params.id);
	if (!userId || !params.attachmentId) {
		return new Response('Invalid request', { status: 400 });
	}

	const db = await getDB();
	const existingAttachment = await db
		.select({ id: userAttachments.id })
		.from(userAttachments)
		.where(and(eq(userAttachments.id, params.attachmentId), eq(userAttachments.userId, userId)))
		.get();
	if (!existingAttachment) {
		return new Response('Attachment not found', { status: 404 });
	}

	await db.delete(userAttachments).where(eq(userAttachments.id, params.attachmentId));

	return new Response(null, { status: 204 });
}
