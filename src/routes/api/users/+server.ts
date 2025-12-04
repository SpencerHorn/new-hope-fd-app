// src/routes/api/users/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit';
import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/users
export const GET: RequestHandler = async () => {
	const db = getDB();

	const result = db.select().from(users).all();
	return json(result);
};

// POST /api/users
export const POST: RequestHandler = async ({ request }) => {
	const db = getDB();
	const data = await request.json();

	// Ensure required fields
	if (!data.firstName || !data.lastName || !data.personalEmail || !data.phone) {
		return json({ message: 'Missing required fields' }, { status: 400 });
	}

	// Prevent duplicate phone numbers
	const existing = db.select().from(users).where(eq(users.phone, data.phone)).get();

	if (existing) {
		return json({ message: 'A user with this phone number already exists.' }, { status: 400 });
	}

	const inserted = db
		.insert(users)
		.values({
			firstName: data.firstName,
			lastName: data.lastName,
			personalEmail: data.personalEmail,
			phone: data.phone,
			role: 'probationary'
		})
		.returning()
		.get();

	return json(inserted, { status: 201 });
};
