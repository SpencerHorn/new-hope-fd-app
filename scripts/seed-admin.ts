import { getDB } from '../src/lib/db/client';
import { authUsers } from '../src/lib/db/schema';
import { Argon2id } from 'oslo/password';
import { eq } from 'drizzle-orm';

async function main() {
	const db = await getDB();

	const email = 'admin@newhopefd.org';
	const password = 'ChangeMeNow!123';

	// Check if admin already exists
	const existing = db.select().from(authUsers).where(eq(authUsers.email, email)).get();

	if (existing) {
		console.log('✔ Admin user already exists:', existing);
		return;
	}

	console.log('Creating admin user...');

	// ✅ Correct: DO NOT BASE64 ENCODE — store hash AS-IS
	const hashedPassword = await new Argon2id().hash(password);

	await db
		.insert(authUsers)
		.values({
			email,
			password_hash: hashedPassword
		})
		.run();

	console.log('✔ Admin user created successfully!');
	console.log('Login email:', email);
	console.log('Temporary password:', password);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
