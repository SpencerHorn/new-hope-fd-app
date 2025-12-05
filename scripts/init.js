// scripts/init.js
import fs from 'fs';
import { execSync } from 'child_process';
import { getDB } from '../src/lib/db/client.js';
import { authUsers } from '../src/lib/db/schema.js';
import { eq } from 'drizzle-orm';
import { Argon2id } from 'oslo/password';

const PROD = process.env.NODE_ENV === 'production';

async function ensureDirs() {
	if (!PROD) return;

	const needed = ['/var/data', '/var/data/drizzle', '/var/data/drizzle/meta'];

	for (const dir of needed) {
		if (!fs.existsSync(dir)) {
			console.log('Creating missing directory:', dir);
			fs.mkdirSync(dir, { recursive: true });
		}
	}
}

async function runMigrations() {
	if (!PROD) return;

	console.log('Running migrations...');
	try {
		execSync('npm run db:migrate', { stdio: 'inherit' });
	} catch (err) {
		console.error('Migration error:', err);
	}
}

async function seedAdminUser() {
	const db = await getDB();

	const existing = await db
		.select()
		.from(authUsers)
		.where(eq(authUsers.email, 'admin@newhopefd.org'))
		.get();

	if (existing) {
		console.log('Admin already exists — skipping seed');
		return;
	}

	console.log('Seeding admin user...');

	const password = 'ChangeMeNow!123';
	const hashed = await new Argon2id().hash(password);

	await db.insert(authUsers).values({
		email: 'admin@newhopefd.org',
		password_hash: hashed
	});

	console.log('Admin seeded! Login:');
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
