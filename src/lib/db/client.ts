import fs from 'fs';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

// Determine DB path depending on environment
const dbPath = process.env.NODE_ENV === 'production' ? '/var/data/newhopefd.db' : 'newhopefd.db';

// Ensure the DB file exists in production BEFORE opening it
if (process.env.NODE_ENV === 'production') {
	if (!fs.existsSync('/var/data')) {
		fs.mkdirSync('/var/data', { recursive: true });
	}

	if (!fs.existsSync(dbPath)) {
		console.log('Creating SQLite database at', dbPath);
		fs.writeFileSync(dbPath, '');
	}
}

// Now safely open the DB
const sqlite = new Database(dbPath);

export const db = drizzle(sqlite, { schema });

console.log(`SQLite DB loaded from: ${dbPath}`);
