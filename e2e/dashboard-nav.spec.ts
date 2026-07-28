import { expect, test } from '@playwright/test';

async function login(page: import('@playwright/test').Page) {
	await page.goto('/login');
	await page.getByPlaceholder('Email').fill('admin@newhopefd.org');
	await page.getByPlaceholder('Password').fill('ChangeMeNow!123');
	await page.getByRole('button', { name: 'Sign In' }).click();
	await expect(page).toHaveURL(/\/dashboard$/);
}

test('dashboard button routes to dashboard page', async ({ page }) => {
	await login(page);

	await page.getByRole('button', { name: 'User Management' }).click();
	await expect(page).toHaveURL(/\/users$/);

	await page.getByRole('button', { name: 'Dashboard' }).click();
	await expect(page).toHaveURL(/\/dashboard$/);
	await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
