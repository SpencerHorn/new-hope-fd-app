import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { isAdministrator, isAppRole } from '$lib/auth/roles';
import { eq } from 'drizzle-orm';

export async function POST({ params, request, locals }) {
	if (!isAdministrator(locals?.appUser?.role)) {
		return new Response('Forbidden', { status: 403 });
	}

	const { role } = await request.json();
	if (!isAppRole(role)) {
		return new Response('Invalid role', { status: 400 });
	}

	const db = await getDB();

	await db
		.update(users)
		.set({ role })
		.where(eq(users.id, Number(params.id)));

	return new Response(null, { status: 204 });
}
