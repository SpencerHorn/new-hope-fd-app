import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

// Detect build vs runtime
const isBuild = process.env.BUILD_ENV === 'build';

// Local dev DB
let dbPath = 'newhopefd.db';

if (!isBuild && process.env.NODE_ENV === 'production') {
	// Runtime on Render (NOT during build)
	dbPath = '/var/data/newhopefd.db';

	// Create DB file if missing (runtime only)
	try {
		await import('fs').then(({ default: fs }) => {
			if (!fs.existsSync('/var/data')) {
				fs.mkdirSync('/var/data', { recursive: true });
			}
			if (!fs.existsSync(dbPath)) {
				fs.writeFileSync(dbPath, '');
			}
		});
	} catch (err) {
		console.warn('Could not initialize DB during runtime:', err);
	}
}

// Open DB only in runtime (NOT build)
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

console.log(`SQLite DB loaded from ${dbPath}`);
