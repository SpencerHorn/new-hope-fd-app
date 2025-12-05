// src/lib/db/client.ts
import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const isProd = process.env.NODE_ENV === 'production';
const isBuild = process.env.BUILD_ENV === 'build';

const LOCAL_DB = 'newhopefd.db';
const PROD_DB = '/var/data/newhopefd.db';

let dbInstance: BetterSQLite3Database<typeof schema> | null = null;

export function getDB() {
	if (dbInstance) return dbInstance;

	let dbPath: string;

	if (isBuild) {
		// During build, use in-memory DB so we don't touch the filesystem
		dbPath = ':memory:';
	} else if (isProd) {
		dbPath = PROD_DB;
		const fs = eval('require')('fs') as typeof import('fs');

		if (!fs.existsSync('/var/data')) {
			fs.mkdirSync('/var/data', { recursive: true });
		}
		if (!fs.existsSync(dbPath)) {
			fs.writeFileSync(dbPath, '');
		}
	} else {
		dbPath = LOCAL_DB;
	}

	const sqlite = new Database(dbPath);
	dbInstance = drizzle(sqlite, { schema });

	console.log(`SQLite DB loaded from ${dbPath} (prod=${isProd}, build=${isBuild})`);

	return dbInstance;
}
