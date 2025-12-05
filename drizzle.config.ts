import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'sqlite',
	schema: './src/lib/db/schema.ts',

	dbCredentials: {
		url: process.env.NODE_ENV === 'production' ? '/var/data/newhopefd.db' : 'newhopefd.db'
	},

	migrations: {
		table: '__drizzle_migrations'
	}
});
