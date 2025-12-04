import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import fs from 'fs';
import path from 'path';

// Detect build vs runtime
const isBuild = process.env.BUILD_ENV === 'build';

let dbPath = 'newhopefd.db'; // local development

if (!isBuild && process.env.NODE_ENV === 'production') {
	// Runtime on Render
	dbPath = '/var/data/newhopefd.db';

	// Ensure /var/data exists
	if (!fs.existsSync('/var/data')) {
		fs.mkdirSync('/var/data', { recursive: true });
	}

	// Ensure database file exists
	if (!fs.existsSync(dbPath)) {
		fs.writeFileSync(dbPath, '');
		console.log('Created SQLite database:', dbPath);
	}
}

// DO NOT open SQLite during build!
if (isBuild) {
	console.log('Skipping SQLite initialization during build.');
	// Return a placeholder — SvelteKit build won't actually query DB.
	export const db = {} as any;
} else {
	const sqlite = new Database(dbPath);
	console.log(`SQLite DB loaded from: ${dbPath}`);

	export const db = drizzle(sqlite, { schema });
}
