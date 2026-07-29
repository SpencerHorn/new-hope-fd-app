import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { and, eq, isNull } from 'drizzle-orm';

export async function getAppUserFromSessionUser(sessionUser: unknown) {
	const email =
		typeof sessionUser === 'object' &&
		sessionUser !== null &&
		typeof (sessionUser as { email?: unknown }).email === 'string'
			? (sessionUser as { email: string }).email
			: null;
	if (!email) return null;

	const db = await getDB();
	const appUser = await db
		.select({
			id: users.id,
			firstName: users.firstName,
			lastName: users.lastName,
			personalEmail: users.personalEmail,
			role: users.role
		})
		.from(users)
		.where(and(eq(users.personalEmail, email), isNull(users.deletedAt)))
		.get();

	return appUser ?? null;
}
