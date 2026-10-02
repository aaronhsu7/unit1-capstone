const { test, expect } = require('@playwright/test');

test.describe('Authentication pages', () => {
  test('login page displays its controls', async ({ page }) => {
    await page.goto('/login');

    await expect(
      page.getByRole('heading', { name: 'Welcome Back!' }),
    ).toBeVisible();

    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('signup page displays its controls', async ({ page }) => {
    await page.goto('/signup');

    await expect(
      page.getByRole('heading', { name: /create an account/i }),
    ).toBeVisible();

    await expect(page.locator('input').nth(0)).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /create account/i }),
    ).toBeVisible();
  });
});
