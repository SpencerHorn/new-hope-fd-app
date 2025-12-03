import { db } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { json, type RequestHandler } from '@sveltejs/kit';

// Helper: normalize phone to XXX-XXX-XXXX
function normalizePhone(raw: string): string | null {
	const digits = raw.replace(/\D/g, ''); // strip non-digits
	if (digits.length !== 10) return null;
	const area = digits.slice(0, 3);
	const prefix = digits.slice(3, 6);
	const line = digits.slice(6);
	return `${area}-${prefix}-${line}`;
}

export const GET: RequestHandler = async () => {
	const allUsers = await db.select().from(users);
	return json(allUsers);
};

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const { firstName, lastName, personalEmail, phone } = data;

	const normalizedPhone = normalizePhone(phone);
	if (!normalizedPhone) {
		return json(
			{ success: false, message: 'Phone number must be 10 digits (US format).' },
			{ status: 400 }
		);
	}

	// Check if phone number already exists (after normalization)
	const existing = await db.select().from(users).where(eq(users.phone, normalizedPhone));

	if (existing.length > 0) {
		return json(
			{ success: false, message: 'A user with this phone number already exists.' },
			{ status: 400 }
		);
	}

	await db.insert(users).values({
		firstName,
		lastName,
		personalEmail,
		phone: normalizedPhone,
		role: 'probationary'
	});

	return json({ success: true });
};
