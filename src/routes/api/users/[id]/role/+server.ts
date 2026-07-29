import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { isAdministrator, isAppRole } from '$lib/auth/roles';
import { and, eq, isNull } from 'drizzle-orm';

export async function POST({ params, request, locals }) {
	if (!isAdministrator(locals?.appUser?.role)) {
		return new Response('Forbidden', { status: 403 });
	}

	const { role } = await request.json();
	if (!isAppRole(role)) {
		return new Response('Invalid role', { status: 400 });
	}

	const db = await getDB();
	const id = Number(params.id);
	if (!id) {
		return new Response('Invalid user id', { status: 400 });
	}

	const existing = await db
		.select({ id: users.id })
		.from(users)
		.where(and(eq(users.id, id), isNull(users.deletedAt)))
		.get();
	if (!existing) {
		return new Response('User not found', { status: 404 });
	}

	await db
		.update(users)
		.set({ role })
		.where(eq(users.id, id));

	return new Response(null, { status: 204 });
}
