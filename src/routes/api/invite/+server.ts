import { json } from '@sveltejs/kit';
import { getDB } from '$lib/db/client';
import { invites } from '$lib/db/schema';
import crypto from 'crypto';

export const POST = async ({ request, locals }) => {
	// Only allow authenticated users to create invites
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const db = getDB();

	const { email } = await request.json();
	if (!email) return json({ error: 'Email required' }, { status: 400 });

	const token = crypto.randomUUID();

	await db.insert(invites).values({
		email,
		token
	});

	return json({
		inviteUrl: `/invite/${token}`,
		token
	});
};
