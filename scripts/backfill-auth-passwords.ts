import { getDB } from '../src/lib/db/client';
import { authUsers, users } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../src/lib/server/password';
import { generateTemporaryPassword } from '../src/lib/server/tempPassword';

type CredentialRow = {
	userId: number;
	email: string;
	temporaryPassword: string;
};

async function main() {
	const db = await getDB();
	const profiles = await db.select().from(users).all();

	const credentials: CredentialRow[] = [];

	for (const profile of profiles) {
		const email = String(profile.personalEmail ?? '')
			.trim()
			.toLowerCase();
		if (!email) continue;

		const temporaryPassword = generateTemporaryPassword();
		const passwordHash = await hashPassword(temporaryPassword);
		const existingAuth = await db.select().from(authUsers).where(eq(authUsers.email, email)).get();

		if (existingAuth) {
			await db
				.update(authUsers)
				.set({
					password_hash: passwordHash,
					mustChangePassword: 1,
					email
				})
				.where(eq(authUsers.id, existingAuth.id));
		} else {
			await db.insert(authUsers).values({
				email,
				password_hash: passwordHash,
				mustChangePassword: 1
			});
		}

		credentials.push({
			userId: profile.id,
			email,
			temporaryPassword
		});
	}

	console.log(`Updated ${credentials.length} authentication account(s).`);
	console.log('Share these temporary passwords securely with members:');
	console.log('userId,email,temporaryPassword');
	for (const row of credentials) {
		console.log(`${row.userId},${row.email},${row.temporaryPassword}`);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
