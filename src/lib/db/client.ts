import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

let dbPath = 'newhopefd.db';

// Detect SvelteKit build (BUILD_ENV set in build command)
const isBuild = process.env.BUILD_ENV === 'build';

// Runtime-only environment (Render sets NODE_ENV=production when serving)
const isRuntime = !isBuild && process.env.NODE_ENV === 'production';

if (isRuntime) {
	// Render persistent disk
	dbPath = '/var/data/newhopefd.db';

	// SAFE RUNTIME-ONLY FILESYSTEM ACCESS
	try {
		const fs = await import('fs');

		if (!fs.existsSync('/var/data')) {
			fs.mkdirSync('/var/data', { recursive: true });
		}

		if (!fs.existsSync(dbPath)) {
			fs.writeFileSync(dbPath, '');
		}
	} catch (err) {
		console.error('Failed to initialize SQLite runtime file:', err);
	}
}

// IMPORTANT: this must run ONLY after dbPath is finalized
export const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

console.log(`SQLite loaded from: ${dbPath} | build=${isBuild} runtime=${isRuntime}`);
