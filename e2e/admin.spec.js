import { expect, test } from '@playwright/test';
import { expectUnauthorized, fixtures, passwords, signIn } from './support.js';

test('admin reviews the dashboard, verifies a company, and enforces role restrictions', async ({ page }) => {
  await signIn(page, fixtures.adminEmail, 'invalid-password');
  await expect(page.getByRole('alert')).toContainText('Invalid email or password');
  await signIn(page, fixtures.adminEmail, passwords.admin);
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Admin dashboard' })).toBeVisible();
  await expect(page.getByText('Companies', { exact: true })).toBeVisible();

  await page.getByRole('link', { name: 'Manage Companies' }).click();
  const companyRow = page.getByRole('row').filter({ hasText: fixtures.companyName });
  await expect(companyRow).toContainText('Not verified');
  await companyRow.getByRole('button', { name: 'Verify' }).click();
  await expect(page.getByText('Company verified successfully', { exact: true })).toBeVisible();
  await expect(companyRow).toContainText('Verified');

  await page.getByLabel('Verification status').selectOption('verified');
  await expect(page.getByRole('row').filter({ hasText: fixtures.companyName })).toContainText('Verified');
  await page.reload();
  await expect(page.getByRole('row').filter({ hasText: fixtures.companyName })).toContainText('Verified');

  await expectUnauthorized(page, '/student/dashboard');
  await page.goto('/admin/dashboard');
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login$/);
});
