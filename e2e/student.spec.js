import { expect, test } from '@playwright/test';
import { expectUnauthorized, fixtures, passwords, signIn } from './support.js';

test('student registers, updates profile, applies once, and retains protected access rules', async ({ page }) => {
  await signIn(page, fixtures.studentEmail, 'invalid-password');
  await expect(page.getByRole('alert')).toContainText('Invalid email or password');

  await page.goto('/register');
  await page.getByLabel('Full name').fill(fixtures.studentName);
  await page.getByLabel('Email', { exact: true }).fill(fixtures.studentEmail);
  await page.getByLabel('Phone number').fill('+1 555 010 2040');
  await page.getByLabel('Password', { exact: true }).fill(passwords.student);
  await page.getByLabel('Confirm password').fill('Different-password');
  await page.getByLabel('I accept the terms and conditions.').check();
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('alert')).toContainText('Passwords do not match');

  await page.getByLabel('Confirm password').fill(passwords.student);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/student\/dashboard$/);

  await page.getByRole('link', { name: 'My Profile' }).click();
  await expect(page.getByRole('heading', { name: fixtures.studentName, level: 1 })).toBeVisible();
  await page.getByLabel('College').fill('E2E State University');
  await page.getByLabel('Degree').fill('BSc');
  await page.getByLabel('Branch').fill('Computer Science');
  await page.getByLabel('Graduation year').fill('2028');
  await page.getByLabel('Skills (comma-separated)').fill('React, Testing');
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.getByRole('status')).toContainText('updated successfully');

  await page.reload();
  await expect(page.getByLabel('College')).toHaveValue('E2E State University');
  await expect(page.getByLabel('Skills (comma-separated)')).toHaveValue('React, Testing');

  await page.getByRole('link', { name: 'Browse Jobs' }).click();
  const browseJob = page.locator('.job-card').filter({ hasText: fixtures.browseJobTitle });
  await expect(browseJob).toBeVisible();
  await browseJob.getByRole('link', { name: 'View details' }).click();
  await expect(page.getByRole('heading', { name: fixtures.browseJobTitle })).toBeVisible();
  await page.getByLabel('Cover letter').fill('I am interested in this E2E test opportunity.');
  await page.getByRole('button', { name: 'Apply now' }).click();
  await expect(page.getByRole('status')).toContainText('Application submitted successfully');

  await page.reload();
  await page.getByLabel('Cover letter').fill('Duplicate submission check.');
  await page.getByRole('button', { name: 'Apply now' }).click();
  await expect(page.getByRole('alert')).toContainText('already applied');

  await page.goto('/student/applications');
  await expect(page.getByRole('heading', { name: 'My applications' })).toBeVisible();
  await expect(page.getByText(fixtures.browseJobTitle)).toBeVisible();
  await expectUnauthorized(page, '/admin/dashboard');

  await page.goto('/student/dashboard');
  await expect(page).toHaveURL(/\/student\/dashboard$/);
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/student/profile');
  await expect(page).toHaveURL(/\/login$/);

  await signIn(page, fixtures.studentEmail, passwords.student);
  await expect(page).toHaveURL(/\/student\/dashboard$/);
  await page.getByRole('link', { name: 'My Profile' }).click();
  await expect(page.getByLabel('College')).toHaveValue('E2E State University');
});
