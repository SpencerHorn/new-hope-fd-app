import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { isAdministrator } from '$lib/auth/roles';
import { eq } from 'drizzle-orm';

export async function DELETE({ params, locals }) {
	if (!isAdministrator(locals?.appUser?.role)) {
		return new Response('Forbidden', { status: 403 });
	}

	const db = await getDB();

	await db.delete(users).where(eq(users.id, Number(params.id)));

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

	await db
		.update(users)
		.set({
			firstName: String(payload.firstName ?? ''),
			lastName: String(payload.lastName ?? ''),
			address: payload.address ? String(payload.address) : null,
			personalEmail: String(payload.personalEmail ?? ''),
			phone: String(payload.phone ?? ''),
			workEmail: payload.workEmail ? String(payload.workEmail) : null,
			fitTestDate: payload.fitTestDate ? String(payload.fitTestDate) : null,
			maskSize: payload.maskSize ? String(payload.maskSize) : null,
			tshirtSize: payload.tshirtSize ? String(payload.tshirtSize) : null
		})
		.where(eq(users.id, id));

	return new Response(null, { status: 204 });
}
