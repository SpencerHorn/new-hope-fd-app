// src/lib/db/client.ts
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

// Determine environment
const isProd = process.env.NODE_ENV === 'production';
const isBuild = process.env.BUILD_ENV === 'build';

// DB paths
const LOCAL_DB = 'newhopefd.db';
const PROD_DB = '/var/data/newhopefd.db';

// Cached instance
let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDB() {
	// If already initialized, return cached
	if (dbInstance) return dbInstance;

	// Skip DB access during build
	if (isBuild) {
		throw new Error('Attempted DB access during build.');
	}

	const dbPath = isProd ? PROD_DB : LOCAL_DB;

	// Only check/create files in production runtime
	if (isProd) {
		// Dynamic import avoids require() issues
		const fs = requireFS();

		// Ensure directory exists
		if (!fs.existsSync('/var/data')) {
			fs.mkdirSync('/var/data', { recursive: true });
		}

		// Ensure database file exists
		if (!fs.existsSync(dbPath)) {
			fs.writeFileSync(dbPath, '');
		}
	}

	// Open DB
	const sqlite = new Database(dbPath);
	dbInstance = drizzle(sqlite, { schema });

	console.log(`SQLite DB loaded at ${dbPath}`);
	return dbInstance;
}

// Wrapper for fs import that avoids bundling issues
function requireFS() {
	return eval('require')('fs');
}
