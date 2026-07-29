import { expect, test } from '@playwright/test';

async function login(page: import('@playwright/test').Page) {
	await page.goto('/login');
	await page.getByPlaceholder('Email').fill('admin@newhopefd.org');
	await page.getByPlaceholder('Password').fill('ChangeMeNow!123');
	await page.getByRole('button', { name: 'Sign In' }).click();
	await expect(page).toHaveURL(/\/dashboard$/);
	await expect(page.getByRole('heading', { name: 'My Dashboard' })).toBeVisible();
}

test('shows inline validation errors with friendly messaging', async ({ page }) => {
	await login(page);

	await page.locator('#firstName').fill('');
	await page.locator('#personalEmail').fill('not-an-email');
	await page.locator('#phone').fill('12345');
	await page.getByRole('button', { name: 'Save Profile' }).click();

	await expect(page.getByText('Please fix the highlighted fields and try again.')).toBeVisible();
	await expect(page.getByText('Please enter your first name.')).toBeVisible();
	await expect(page.getByText('Enter a valid email address, like name@example.com.')).toBeVisible();
	await expect(page.getByText('Use a 10-digit phone number.')).toBeVisible();
});

test('saves profile changes and persists after reload', async ({ page }) => {
	await login(page);

	const updatedAddress = `123 Centered Dashboard Ln ${Date.now()}`;
	await page.locator('#address').fill(updatedAddress);
	await page.getByRole('button', { name: 'Save Profile' }).click();

	await expect(page.getByText('Profile updated.')).toBeVisible();

	await page.reload();
	await expect(page.locator('#address')).toHaveValue(updatedAddress);
});
