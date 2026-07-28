import { fail, redirect } from '@sveltejs/kit';
import { getLucia } from '$lib/server/auth';
import { getDB } from '$lib/db/client';
import { authUsers, users } from '$lib/db/schema';
import { eq, or } from 'drizzle-orm';
import { Argon2id } from 'oslo/password';

const PHONE_DIGIT_COUNT = 10;

function normalizeName(value: string): string {
	return value
		.trim()
		.toLowerCase()
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatPhone(raw: string): string | null {
	const digits = raw.replace(/\D/g, '');
	if (digits.length !== PHONE_DIGIT_COUNT) return null;
	return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export const actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const firstNameRaw = String(form.get('firstName') ?? '').trim();
		const lastNameRaw = String(form.get('lastName') ?? '').trim();
		const email = String(form.get('email') ?? '').trim().toLowerCase();
		const phoneRaw = String(form.get('phone') ?? '');
		const password = String(form.get('password') ?? '');
		const confirm = String(form.get('confirm') ?? '');

		const values = {
			firstName: firstNameRaw,
			lastName: lastNameRaw,
			email,
			phone: phoneRaw,
			password,
			confirm
		};

		if (!firstNameRaw || !lastNameRaw || !email || !phoneRaw || !password || !confirm) {
			return fail(400, { message: 'All fields are required.', values });
		}

		if (password.length < 10) {
			return fail(400, { message: 'Password must be at least 10 characters.', values });
		}

		if (password !== confirm) {
			return fail(400, { message: 'Passwords do not match.', values });
		}

		const phone = formatPhone(phoneRaw);
		if (!phone) {
			return fail(400, { message: 'Phone number must contain exactly 10 digits.', values });
		}

		const db = await getDB();

		const existingAuthUser = await db.select().from(authUsers).where(eq(authUsers.email, email)).get();
		if (existingAuthUser) {
			return fail(400, { message: 'An account with that email already exists.', values });
		}

		const existingProfile = await db
			.select({ id: users.id })
			.from(users)
			.where(or(eq(users.personalEmail, email), eq(users.phone, phone)))
			.get();
		if (existingProfile) {
			return fail(400, {
				message: 'A member profile with that email or phone already exists. Please contact an administrator.',
				values
			});
		}

		const passwordHash = await new Argon2id().hash(password);
		const insertedAuth = await db
			.insert(authUsers)
			.values({
				email,
				password_hash: passwordHash
			})
			.returning({ id: authUsers.id });

		if (!insertedAuth[0]?.id) {
			return fail(500, { message: 'Unable to create account.', values });
		}

		await db.insert(users).values({
			firstName: normalizeName(firstNameRaw),
			lastName: normalizeName(lastNameRaw),
			personalEmail: email,
			phone,
			role: 'probationary'
		});

		const lucia = await getLucia();
		const session = await lucia.createSession(insertedAuth[0].id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);

		cookies.set(sessionCookie.name, sessionCookie.value, {
			...sessionCookie.attributes,
			path: '/'
		});

		throw redirect(302, '/');
	}
};
