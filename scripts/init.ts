// scripts/init.ts
import fs from 'fs';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDB } from '../src/lib/db/client';
import { ensureAdminUser } from '../src/lib/server/adminSeed';
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

	await ensureAdminUser({
		db,
		hashPassword: (password) => new Argon2id().hash(password)
	});
}

async function main() {
	await ensureDirs();
	await runMigrations();
	await seedAdminUser();

	console.log('Init script complete.');
}

main();
