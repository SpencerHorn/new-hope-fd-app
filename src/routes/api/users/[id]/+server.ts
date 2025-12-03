import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/db/client';
import { users, onboardingItems, userOnboardingStatus } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params }) => {
	const user = db
		.select()
		.from(users)
		.where(eq(users.id, Number(params.id)))
		.get();
	return json(user);
};

export const PATCH: RequestHandler = async ({ request, params }) => {
	const data = await request.json();

	const result = await db
		.update(users)
		.set({ ...data })
		.where(eq(users.id, Number(params.id)))
		.returning()
		.get();

	return json({ success: true, user: result });
};

export const DELETE: RequestHandler = async ({ params }) => {
	const id = Number(params.id);

	await db.delete(users).where(eq(users.id, id));

	return json({ success: true });
};
