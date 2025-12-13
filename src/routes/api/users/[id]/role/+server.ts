import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST({ params, request }) {
	const { role } = await request.json();
	const db = await getDB();

	await db
		.update(users)
		.set({ role })
		.where(eq(users.id, Number(params.id)));

	return new Response(null, { status: 204 });
}
