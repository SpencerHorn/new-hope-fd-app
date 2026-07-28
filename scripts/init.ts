// scripts/init.ts
import fs from 'fs';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDB } from '../src/lib/db/client';
import { authUsers } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Argon2id } from 'oslo/password';

const PROD = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

async function ensureDirs() {
	if (!PROD) return;

	const dirs = ['/var/data', '/var/data/drizzle', '/var/data/drizzle/meta'];

	for (const dir of dirs) {
		if (!fs.existsSync(dir)) {
			console.log('Creating directory:', dir);
			fs.mkdirSync(dir, { recursive: true });
		}
	}
}

async function runMigrations() {
	if (!PROD) return;

	console.log('Running migrations...');
	const db = await getDB();
	migrate(db, { migrationsFolder: './migrations' });
}

async function seedAdminUser() {
	const db = await getDB();

	const existing = await db
		.select()
		.from(authUsers)
		.where(eq(authUsers.email, 'admin@newhopefd.org'))
		.get();

	if (existing) {
		console.log('Admin exists — skipping seed');
		return;
	}

	console.log('Seeding admin user...');

	const password = 'ChangeMeNow!123';
	const hashed = await new Argon2id().hash(password);

	await db.insert(authUsers).values({
		email: 'admin@newhopefd.org',
		password_hash: hashed
	});

	console.log('Seeded admin user:');
	console.log('Email: admin@newhopefd.org');
	console.log('Password:', password);
}

async function main() {
	await ensureDirs();
	await runMigrations();
	await seedAdminUser();

	console.log('Init script complete.');
}

main();
