// src/lib/db/client.ts
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

// Environment flags
const isProd = process.env.NODE_ENV === 'production';
const isBuild = process.env.BUILD_ENV === 'build';

const LOCAL_DB = 'newhopefd.db';
const PROD_DB = '/var/data/newhopefd.db';

let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDB() {
	// Prevent database initialization during static build on Render
	if (isBuild) {
		throw new Error('Database access attempted during build.');
	}

	// Return cached DB
	if (dbInstance) return dbInstance;

	const dbPath = isProd ? PROD_DB : LOCAL_DB;

	// Production setup (runtime only)
	if (isProd) {
		const fs = eval('require')('fs');

		if (!fs.existsSync('/var/data')) {
			fs.mkdirSync('/var/data', { recursive: true });
		}
		if (!fs.existsSync(dbPath)) {
			fs.writeFileSync(dbPath, '');
		}
	}

	// Open the DB
	const sqlite = new Database(dbPath);
	dbInstance = drizzle(sqlite, { schema });

	console.log(`SQLite database loaded from: ${dbPath}`);

	return dbInstance;
}
