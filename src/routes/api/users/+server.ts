import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

// HELPER FUNCTIONS
function normalizePhone(raw: string): string | null {
	const digits = raw.replace(/\D/g, '');
	if (digits.length !== 10) return null;
	return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function formatName(name: string): string {
	if (!name) return name;
	return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

// GET all users
export const GET: RequestHandler = async () => {
	const allUsers = await db.select().from(users);
	return json(allUsers);
};

// CREATE user
export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const { firstName, lastName, personalEmail, phone } = data;

	const normalizedPhone = normalizePhone(phone);
	if (!normalizedPhone) {
		return json({ success: false, message: 'Phone number must be 10 digits.' }, { status: 400 });
	}

	const formattedFirst = formatName(firstName);
	const formattedLast = formatName(lastName);

	// Prevent duplicate phone
	const existing = await db.select().from(users).where(eq(users.phone, normalizedPhone));

	if (existing.length > 0) {
		return json(
			{ success: false, message: 'A user with this phone already exists' },
			{ status: 400 }
		);
	}

	const newUser = await db
		.insert(users)
		.values({
			firstName: formattedFirst,
			lastName: formattedLast,
			personalEmail,
			phone: normalizedPhone,
			role: 'probationary'
		})
		.returning()
		.get();

	return json({ success: true, id: newUser.id });
};
