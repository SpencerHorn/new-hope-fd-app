// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'sqlite',

	// Single source of truth for schema
	schema: './src/lib/db/schema.ts',

	// Database location (local vs Render persistent disk)
	dbCredentials: {
		url: process.env.NODE_ENV === 'production' ? '/var/data/newhopefd.db' : 'newhopefd.db'
	},

	/**
	 * IMPORTANT:
	 * Always use the SAME migrations folder in all environments.
	 * Do NOT change this per-environment.
	 *
	 * Render will read migrations from the repo,
	 * but apply them to the persistent SQLite DB.
	 */
	out: './migrations'

	// Optional (fine to omit since Drizzle defaults are OK):
	// migrations: { table: '__drizzle_migrations' }
});
