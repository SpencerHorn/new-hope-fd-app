// scripts/init.ts
import fs from 'fs';
import crypto from 'crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDB } from '../src/lib/db/client';
import { ensureAdminUser } from '../src/lib/server/adminSeed';
import { Argon2id } from 'oslo/password';

const PROD = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

type JournalEntry = { tag: string; when: number };

function readJournalEntries(): JournalEntry[] {
	const journal = JSON.parse(fs.readFileSync('./migrations/meta/_journal.json', 'utf8')) as {
		entries: JournalEntry[];
	};
	return journal.entries;
}

function migrationHashForTag(tag: string): string | null {
	const sqlPath = `./migrations/${tag}.sql`;
	if (!fs.existsSync(sqlPath)) return null;
	const sql = fs.readFileSync(sqlPath, 'utf8');
	return crypto.createHash('sha256').update(sql).digest('hex');
}

function ensureMigrationTable(sqlite: any): void {
	sqlite.exec(`
		CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
			id SERIAL PRIMARY KEY,
			hash text NOT NULL,
			created_at numeric
		);
	`);
}

function getExistingMigrationHashes(sqlite: any): Set<string> {
	const hasMigrationTable = Boolean(
		sqlite
			.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = '__drizzle_migrations'")
			.get()
	);
	if (!hasMigrationTable) return new Set();

	const rows = sqlite
		.prepare('SELECT hash FROM "__drizzle_migrations" WHERE hash IS NOT NULL')
		.all() as Array<{ hash: string }>;

	return new Set(rows.map((r) => r.hash));
}

function insertMissingMigrationHashes(sqlite: any, entries: JournalEntry[]): void {
	ensureMigrationTable(sqlite);
	const existingHashes = getExistingMigrationHashes(sqlite);
	const insertStmt = sqlite.prepare('INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES (?, ?)');

	for (const entry of entries) {
		const hash = migrationHashForTag(entry.tag);
		if (!hash || existingHashes.has(hash)) continue;
		insertStmt.run(hash, entry.when);
	}
}

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

	const hasExistingAppSchema = Boolean(
		sqlite
			.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'auth_sessions'")
			.get()
	);

	if (hasExistingAppSchema) {
		const journalEntries = readJournalEntries();
		const journalHashes = journalEntries
			.map((entry) => migrationHashForTag(entry.tag))
			.filter((hash): hash is string => Boolean(hash));
		const existingHashes = getExistingMigrationHashes(sqlite);
		const hasKnownHash = journalHashes.some((hash) => existingHashes.has(hash));

		if (!hasKnownHash) {
			console.log('Detected legacy schema without matching drizzle hashes. Creating migration baseline...');
			insertMissingMigrationHashes(sqlite, journalEntries);
		}
	}

	try {
		migrate(db, { migrationsFolder: './migrations' });
	} catch (error: any) {
		const message = String(error?.message ?? '');
		const causeMessage = String(error?.cause?.message ?? '');
		const isAlreadyExistsError =
			message.includes('Failed to run the query') && causeMessage.includes('already exists');

		if (!hasExistingAppSchema || !isAlreadyExistsError) {
			throw error;
		}

		console.log('Migration conflict detected on existing schema. Rebuilding migration baseline and retrying...');
		insertMissingMigrationHashes(sqlite, readJournalEntries());
		migrate(db, { migrationsFolder: './migrations' });
	}
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
