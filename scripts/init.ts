// scripts/init.ts
import fs from 'fs';
import crypto from 'crypto';
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
	const sqlite = (db as any).$client;

	const hasMigrationTable = Boolean(
		sqlite
			.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = '__drizzle_migrations'")
			.get()
	);
	const hasExistingAppSchema = Boolean(
		sqlite
			.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'auth_sessions'")
			.get()
	);

	const migrationCount = hasMigrationTable
		? Number(
				(sqlite
					.prepare('SELECT COUNT(*) AS count FROM "__drizzle_migrations"')
					.get() as { count: number })?.count ?? 0
			)
		: 0;

	const needsBaseline = hasExistingAppSchema && (!hasMigrationTable || migrationCount === 0);

	if (needsBaseline) {
		console.log('Detected existing schema without drizzle metadata. Creating migration baseline...');
		sqlite.exec(`
			CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
				id SERIAL PRIMARY KEY,
				hash text NOT NULL,
				created_at numeric
			);
		`);

		const journal = JSON.parse(fs.readFileSync('./migrations/meta/_journal.json', 'utf8')) as {
			entries: Array<{ tag: string; when: number }>;
		};

		const insertStmt = sqlite.prepare(
			'INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES (?, ?)'
		);
		const hasHashStmt = sqlite.prepare(
			'SELECT 1 FROM "__drizzle_migrations" WHERE hash = ? LIMIT 1'
		);

		for (const entry of journal.entries) {
			const sqlPath = `./migrations/${entry.tag}.sql`;
			if (!fs.existsSync(sqlPath)) continue;

			const sql = fs.readFileSync(sqlPath, 'utf8');
			const hash = crypto.createHash('sha256').update(sql).digest('hex');
			if (!hasHashStmt.get(hash)) {
				insertStmt.run(hash, entry.when);
			}
		}
	}

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
