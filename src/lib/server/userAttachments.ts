import { userAttachments } from '$lib/db/schema';
import type { getDB } from '$lib/db/client';

// users may have any number of attachments; each upload adds a new row
export async function addUserAttachment(
	db: Awaited<ReturnType<typeof getDB>>,
	userId: number,
	file: File
) {
	const fileData = Buffer.from(await file.arrayBuffer());
	return await db
		.insert(userAttachments)
		.values({
			userId,
			fileName: file.name,
			mimeType: file.type || 'application/octet-stream',
			fileSize: fileData.byteLength,
			fileData
		})
		.returning({
			id: userAttachments.id,
			fileName: userAttachments.fileName,
			mimeType: userAttachments.mimeType,
			fileSize: userAttachments.fileSize,
			uploadedAt: userAttachments.uploadedAt
		})
		.get();
}

