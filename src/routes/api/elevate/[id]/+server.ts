import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/db/client';
import { users, onboardingItems, userOnboardingStatus } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, params }) => {
	const { role, workEmail, fitTestDate, maskSize, tshirtSize } = await request.json();

	const updated = await db
		.update(users)
		.set({ role, workEmail, fitTestDate, maskSize, tshirtSize })
		.where(eq(users.id, Number(params.id)))
		.returning()
		.get();

	return json({ success: true, user: updated });
};
