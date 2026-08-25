import { getDB } from '$lib/db/client';
import { authUsers, users } from '$lib/db/schema';
import { isAdministrator } from '$lib/auth/roles';
import { and, eq, isNull } from 'drizzle-orm';

export async function DELETE({ params, request, locals }) {
	if (!isAdministrator(locals?.appUser?.role)) {
		return new Response('Forbidden', { status: 403 });
	}

	const id = Number(params.id);
	if (!id) {
		return new Response('Invalid user id', { status: 400 });
	}

	let reason = '';
	try {
		const payload = await request.json();
		reason = String(payload?.reason ?? '').trim();
	} catch {
		reason = '';
	}
	if (!reason) {
		return new Response('A reason for deletion is required', { status: 400 });
	}

	const db = await getDB();
	const existingProfile = await db
		.select({ id: users.id })
		.from(users)
		.where(and(eq(users.id, id), isNull(users.deletedAt)))
		.get();
	if (!existingProfile) {
		return new Response('User not found', { status: 404 });
	}

	await db
		.update(users)
		.set({ deletedAt: new Date().toISOString(), deletionReason: reason })
		.where(eq(users.id, id));

	return new Response(null, { status: 204 });
}

export async function PATCH({ params, request, locals }) {
	const id = Number(params.id);
	if (!id) {
		return new Response('Invalid user id', { status: 400 });
	}

	const isAdmin = isAdministrator(locals?.appUser?.role);
	const isSelf = locals?.appUser?.id === id;

	if (!isAdmin && !isSelf) {
		return new Response('Forbidden', { status: 403 });
	}

	const payload = await request.json();
	const db = await getDB();
	const existingProfile = await db
		.select()
		.from(users)
		.where(and(eq(users.id, id), isNull(users.deletedAt)))
		.get();
	if (!existingProfile) {
		return new Response('User not found', { status: 404 });
	}

	const normalizedPersonalEmail = String(payload.personalEmail ?? '')
		.trim()
		.toLowerCase();
	if (!normalizedPersonalEmail) {
		return new Response('Personal email is required', { status: 400 });
	}

	const oldPersonalEmail = String(existingProfile.personalEmail ?? '')
		.trim()
		.toLowerCase();

	let targetAuthId: number | null = null;
	if (normalizedPersonalEmail !== oldPersonalEmail) {
		const authIdFromSession = Number(locals?.user?.id);
		const sessionAuthId = Number.isFinite(authIdFromSession) && authIdFromSession > 0 ? authIdFromSession : null;
		const authFromOldEmail = oldPersonalEmail
			? await db.select().from(authUsers).where(eq(authUsers.email, oldPersonalEmail)).get()
			: null;
		const targetAuth =
			isSelf && sessionAuthId
				? await db.select().from(authUsers).where(eq(authUsers.id, sessionAuthId)).get()
				: authFromOldEmail;

		targetAuthId = targetAuth?.id ?? null;

		if (targetAuthId) {
			const conflict = await db.select().from(authUsers).where(eq(authUsers.email, normalizedPersonalEmail)).get();
			if (conflict && conflict.id !== targetAuthId) {
				return new Response('An authentication account already exists with that email.', {
					status: 409
				});
			}
		}
	}

	await db
		.update(users)
		.set({
			firstName: String(payload.firstName ?? ''),
			lastName: String(payload.lastName ?? ''),
			address: payload.address ? String(payload.address) : null,
			personalEmail: normalizedPersonalEmail,
			phone: String(payload.phone ?? ''),
			workEmail: payload.workEmail ? String(payload.workEmail) : null,
			fitTestDate: payload.fitTestDate ? String(payload.fitTestDate) : null,
			maskSize: payload.maskSize ? String(payload.maskSize) : null,
			tshirtSize: payload.tshirtSize ? String(payload.tshirtSize) : null
		})
		.where(eq(users.id, id));

	if (targetAuthId) {
		await db
			.update(authUsers)
			.set({ email: normalizedPersonalEmail })
			.where(eq(authUsers.id, targetAuthId));
	}

	return new Response(null, { status: 204 });
}
