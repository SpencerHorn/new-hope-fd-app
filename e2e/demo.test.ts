import { expect, test } from '@playwright/test';

test('home redirects unauthenticated users to login', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveURL(/\/login$/);
	await expect(page.getByRole('heading', { name: 'Member Login' })).toBeVisible();
});
