import { expect, test } from '@playwright/test';

test('redirects unauthenticated users to login', async ({ page }) => {
	await page.goto('/users');
	await expect(page).toHaveURL(/\/login$/);
	await expect(page.getByRole('heading', { name: 'Member Login' })).toBeVisible();
});

test('logs in seeded admin and lands on dashboard', async ({ page }) => {
	await page.goto('/login');

	await page.getByPlaceholder('Email').fill('admin@newhopefd.org');
	await page.getByPlaceholder('Password').fill('ChangeMeNow!123');
	await page.getByRole('button', { name: 'Sign In' }).click();

	await expect(page).toHaveURL(/\/dashboard$/);
	await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
