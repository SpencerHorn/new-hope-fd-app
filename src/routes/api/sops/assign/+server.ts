import { json } from '@sveltejs/kit';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { getDB } from '$lib/db/client';
import { isAdministrator, isAppRole } from '$lib/auth/roles';
import { sopAssignments, sopDocuments, userSopAssignments, users } from '$lib/db/schema';
import { sendSopAssignmentEmail } from '$lib/server/email';
import { randomUUID } from 'crypto';

type AssignTo =
	| { type: 'all' }
	| { type: 'group'; roles: string[] }
	| { type: 'users'; userIds: number[] };

export const POST = async ({ request, locals }) => {
	if (!isAdministrator(locals?.appUser?.role)) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	const db = getDB();
	const { sopDocumentId, assignTo } = (await request.json()) as {
		sopDocumentId?: string;
		assignTo?: AssignTo;
	};

	const normalizedDocumentId = String(sopDocumentId ?? '').trim();

	if (!normalizedDocumentId || !assignTo) {
		return json({ error: 'Missing required fields' }, { status: 400 });
	}

	const savedDocument = db
		.select({
			id: sopDocuments.id,
			sopTitle: sopDocuments.sopTitle,
			sopNumber: sopDocuments.sopNumber,
			revisionDate: sopDocuments.revisionDate
		})
		.from(sopDocuments)
		.where(eq(sopDocuments.id, normalizedDocumentId))
		.get();

	if (!savedDocument) {
		return json({ error: 'Selected SOP document was not found' }, { status: 404 });
	}

	let targetUsers: Array<{ id: number; firstName: string; lastName: string; workEmail: string | null }> = [];

	if (assignTo.type === 'all') {
		targetUsers = db
			.select({
				id: users.id,
				firstName: users.firstName,
				lastName: users.lastName,
				workEmail: users.workEmail
			})
			.from(users)
			.where(isNull(users.deletedAt))
			.all();
	} else if (assignTo.type === 'group') {
		const roles = (assignTo.roles ?? []).filter((role) => isAppRole(role));
		if (roles.length === 0) {
			return json({ error: 'No valid roles selected' }, { status: 400 });
		}

		targetUsers = db
			.select({
				id: users.id,
				firstName: users.firstName,
				lastName: users.lastName,
				workEmail: users.workEmail
			})
			.from(users)
			.where(and(inArray(users.role, roles), isNull(users.deletedAt)))
			.all();
	} else if (assignTo.type === 'users') {
		if (!assignTo.userIds?.length) {
			return json({ error: 'No users selected' }, { status: 400 });
		}

		targetUsers = db
			.select({
				id: users.id,
				firstName: users.firstName,
				lastName: users.lastName,
				workEmail: users.workEmail
			})
			.from(users)
			.where(and(inArray(users.id, assignTo.userIds), isNull(users.deletedAt)))
			.all();
	}

	if (targetUsers.length === 0) {
		return json({ error: 'No users matched assignment criteria' }, { status: 400 });
	}

	const usersWithWorkEmail = targetUsers.filter((user) => Boolean(user.workEmail?.trim()));

	const assignmentId = randomUUID();
	const now = new Date().toISOString();

	db.transaction(() => {
		db.insert(sopAssignments)
			.values({
				id: assignmentId,
				sopTitle: savedDocument.sopTitle,
				sopNumber: savedDocument.sopNumber,
				revisionDate: savedDocument.revisionDate,
				sopDocumentId: savedDocument.id,
				assignedByUserId: locals.appUser?.id ?? null,
				assignedAt: now
			})
			.run();

		db.insert(userSopAssignments)
			.values(
				targetUsers.map((user) => ({
					id: randomUUID(),
					sopAssignmentId: assignmentId,
					userId: user.id,
					assignedAt: now,
					completedAt: null
				}))
			)
			.run();
	});

	const emailFailures: string[] = [];
	let emailedCount = 0;

	await Promise.all(
		usersWithWorkEmail.map(async (user) => {
			const email = user.workEmail?.trim();
			if (!email) return;

			try {
				await sendSopAssignmentEmail({
					to: email,
					assigneeName: `${user.firstName} ${user.lastName}`.trim(),
					sopTitle: savedDocument.sopTitle,
					sopNumber: savedDocument.sopNumber,
					revisionDate: savedDocument.revisionDate
				});
				emailedCount += 1;
			} catch (error) {
				console.error('Failed to send SOP assignment email', {
					userId: user.id,
					email,
					error
				});
				emailFailures.push(email);
			}
		})
	);

	return json({
		success: true,
		assignedCount: targetUsers.length,
		emailedCount,
		skippedEmailCount: targetUsers.length - usersWithWorkEmail.length,
		emailFailures
	});
};