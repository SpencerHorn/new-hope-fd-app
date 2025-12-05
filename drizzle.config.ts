// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

const prod = process.env.NODE_ENV === 'production';

export default defineConfig({
	dialect: 'sqlite',
	schema: './src/lib/db/schema.ts',

	// The ACTUAL database file location
	dbCredentials: {
		url: prod ? '/var/data/newhopefd.db' : 'newhopefd.db'
	},

	// Store migration meta INSIDE persistent storage
	out: prod
		? '/var/data/drizzle' // Render runtime output (persistent)
		: './migrations' // Local folder

	// Optional but recommended:
	// migrations: { table: "__drizzle_migrations" }
});
