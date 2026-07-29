// src/routes/api/users/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit';
import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { isAdministrator } from '$lib/auth/roles';
import { DEFAULT_ADMIN_EMAIL } from '$lib/server/adminSeed';
import {
	findExistingUserByEmailOrPhone,
	formatPhone,
	normalizePersonalEmail
} from '$lib/server/user-conflicts';

// GET /api/users
export const GET: RequestHandler = async ({ locals }) => {
	const db = await getDB();

	const result =
		locals?.appUser?.role === 'probationary' && locals?.appUser?.id
			? db
				.select()
				.from(users)
				.where(and(eq(users.id, locals.appUser.id), isNull(users.deletedAt)))
				.all()
			: db.select().from(users).where(isNull(users.deletedAt)).all();

	return json(result.filter((user) => user.personalEmail !== DEFAULT_ADMIN_EMAIL));
};

// POST /api/users
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!isAdministrator(locals?.appUser?.role)) {
		return json({ message: 'Forbidden' }, { status: 403 });
	}

	const db = await getDB();
	const data = await request.json();
	const personalEmail = normalizePersonalEmail(String(data.personalEmail ?? ''));
	const formattedPhone = formatPhone(String(data.phone ?? ''));

	// Ensure required fields
	if (!data.firstName || !data.lastName || !personalEmail || !formattedPhone) {
		return json({ message: 'Missing required fields' }, { status: 400 });
	}

	const existing = await findExistingUserByEmailOrPhone(db, personalEmail, formattedPhone);

	if (existing) {
		const sameEmailAsDeleted =
			existing.personalEmail?.toLowerCase() === personalEmail && Boolean(existing.deletedAt);

		if (sameEmailAsDeleted) {
			await db
				.update(users)
				.set({
					firstName: data.firstName,
					lastName: data.lastName,
					personalEmail,
					phone: formattedPhone,
					role: 'probationary',
					deletedAt: null
				})
				.where(eq(users.id, existing.id));

			const restored = await db.select().from(users).where(eq(users.id, existing.id)).get();
			return json(restored, { status: 200 });
		}

		return json({ message: 'A user with that email or phone already exists.' }, { status: 400 });
	}

	const inserted = await db
		.insert(users)
		.values({
			firstName: data.firstName,
			lastName: data.lastName,
			personalEmail,
			phone: formattedPhone,
			role: 'probationary'
		})
		.returning()
		.get();

	return json(inserted, { status: 201 });
};
