import { getDB } from '$lib/db/client';
import { invites } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export async function load({ params }) {
	const db = getDB();

	const item = db.select().from(invites).where(eq(invites.token, params.token)).get();

	if (!item || item.used) {
		throw redirect(302, '/login');
	}

	return { email: item.email, token: params.token };
}
