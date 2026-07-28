import { defineConfig } from '@playwright/test';

export default defineConfig({
	timeout: 30_000,
	use: {
		baseURL: 'http://127.0.0.1:4173'
	},
	webServer: {
		command: 'NODE_ENV=test npm run build && NODE_ENV=test npm run preview -- --host 127.0.0.1 --port 4173',
		port: 4173,
		reuseExistingServer: false,
		env: {
			NODE_ENV: 'test'
		}
	},
	testDir: 'e2e'
});
