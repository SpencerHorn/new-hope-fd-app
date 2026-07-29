import { eq, or } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type * as schema from '$lib/db/schema';
import { users } from '$lib/db/schema';

const PHONE_DIGIT_COUNT = 10;

export function normalizePersonalEmail(value: string): string {
	return value.trim().toLowerCase();
}

export function formatPhone(raw: string): string | null {
	const digits = raw.replace(/\D/g, '');
	if (digits.length !== PHONE_DIGIT_COUNT) return null;
	return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export async function findExistingUserByEmailOrPhone(
	db: BetterSQLite3Database<typeof schema>,
	email: string,
	phone: string
) {
	return db
		.select({ id: users.id, deletedAt: users.deletedAt, personalEmail: users.personalEmail, phone: users.phone })
		.from(users)
		.where(or(eq(users.personalEmail, email), eq(users.phone, phone)))
		.get();
}

export async function findExistingUserByEmail(
	db: BetterSQLite3Database<typeof schema>,
	email: string
) {
	return db.select({ id: users.id }).from(users).where(eq(users.personalEmail, email)).get();
}