import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import fs from 'fs';

const isBuild = process.env.BUILD_ENV === 'build';

let dbPath = 'newhopefd.db';

// If building on Render → DO NOT touch /var/data
if (!isBuild && process.env.NODE_ENV === 'production') {
	dbPath = '/var/data/newhopefd.db';

	// Make sure /var/data exists at runtime
	if (!fs.existsSync('/var/data')) {
		fs.mkdirSync('/var/data', { recursive: true });
	}

	// Create DB if missing
	if (!fs.existsSync(dbPath)) {
		fs.writeFileSync(dbPath, '');
		console.log('Created SQLite DB at', dbPath);
	}
}

// Always export db, but only initialize SQLite at runtime
export const db = isBuild
	? ({} as any) // Placeholder during build — avoids Rollup errors
	: drizzle(new Database(dbPath), { schema });

if (!isBuild) {
	console.log(`SQLite loaded from: ${dbPath}`);
} else {
	console.log('Skipping SQLite init during build');
}
