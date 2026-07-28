import { expect, test } from '@playwright/test';

async function login(page: import('@playwright/test').Page) {
	await page.goto('/login');
	await page.getByPlaceholder('Email').fill('admin@newhopefd.org');
	await page.getByPlaceholder('Password').fill('ChangeMeNow!123');
	await page.getByRole('button', { name: 'Sign In' }).click();
	await expect(page).toHaveURL(/\/dashboard$/);
}

test('create invite and complete signup from invite link', async ({ page, context }) => {
	await login(page);

	await page.getByRole('button', { name: 'Invite User' }).click();
	await expect(page).toHaveURL(/\/invite\/create$/);

	const email = `invitee-${Date.now()}@example.com`;
	await page.getByPlaceholder('Email').fill(email);
	await page.getByRole('button', { name: 'Create Invite' }).click();

	const invitePre = page.locator('pre');
	await expect(invitePre).toBeVisible();
	const inviteUrl = (await invitePre.textContent())?.trim() ?? '';
	expect(inviteUrl).toContain('/invite/');

	await context.clearCookies();

	await page.goto(inviteUrl);
	await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();
	await expect(page.getByText(email)).toBeVisible();

	await page.locator('input[name="password"]').fill('InvitePass123!');
	await page.locator('input[name="confirm"]').fill('InvitePass123!');
	await page.getByRole('button', { name: 'Create Account' }).click();

	await expect(page).toHaveURL(/\/dashboard$/);
	await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

	await page.locator('form[action="/logout"] button').click();
	await expect(page).toHaveURL(/\/login$/);
	await page.getByPlaceholder('Email').fill(email);
	await page.getByPlaceholder('Password').fill('InvitePass123!');
	await page.getByRole('button', { name: 'Sign In' }).click();
	await expect(page).toHaveURL(/\/dashboard$/);
});
