import { expect, test } from '@playwright/test';
import { expectUnauthorized, fixtures, passwords, signIn } from './support.js';

test('recruiter edits company, creates a job, reviews an applicant, and schedules an interview', async ({ page }) => {
  await signIn(page, fixtures.recruiterEmail, 'invalid-password');
  await expect(page.getByRole('alert')).toContainText('Invalid email or password');
  await signIn(page, fixtures.recruiterEmail, passwords.recruiter);
  await expect(page).toHaveURL(/\/company\/dashboard$/);

  await page.getByRole('link', { name: 'Company Profile' }).click();
  await page.getByLabel('Industry').fill('E2E Product Engineering');
  await page.getByLabel('Location').fill('E2E Remote');
  await page.getByRole('button', { name: 'Save company profile' }).click();
  await expect(page.getByRole('status')).toContainText('Company profile saved');
  await page.reload();
  await expect(page.getByLabel('Industry')).toHaveValue('E2E Product Engineering');

  await page.getByRole('link', { name: 'Post New Job' }).click();
  const createdJobTitle = `E2E Recruiter Posting ${fixtures.shortId}`;
  await page.getByLabel('Job title').fill(createdJobTitle);
  await page.getByLabel('Location').fill('E2E Remote');
  await page.getByLabel('Job description').fill('A posting created through the browser E2E flow.');
  await page.getByLabel('Requirements').fill('Basic experience with browser testing.');
  await page.getByRole('button', { name: 'Publish job' }).click();

  await expect(page).toHaveURL(/\/company\/jobs$/);
  const createdJobRow = page.getByRole('row').filter({ hasText: createdJobTitle });
  await expect(createdJobRow).toBeVisible();

  const reviewJobRow = page.getByRole('row').filter({ hasText: fixtures.reviewJobTitle });
  await reviewJobRow.getByRole('link', { name: 'View applicants' }).click();
  const applicant = page.locator('.applicant-card').filter({ hasText: fixtures.applicantEmail });
  await expect(applicant).toBeVisible();
  await applicant.getByLabel('Application status').selectOption('Shortlisted');
  await expect(page.getByRole('status')).toContainText('Application status updated successfully');

  const meetingLink = 'https://meet.example.test/e2e-interview';
  await applicant.getByLabel('Meeting link').last().fill(meetingLink);
  await applicant.getByRole('button', { name: 'Schedule interview' }).click();
  await expect(applicant.getByRole('status')).toContainText('Interview scheduled successfully');
  await page.reload();
  await expect(page.locator('.applicant-card').filter({ hasText: fixtures.applicantEmail })).toContainText(meetingLink);

  await expectUnauthorized(page, '/admin/dashboard');
  await page.goto('/company/dashboard');
  await expect(page).toHaveURL(/\/company\/dashboard$/);
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login$/);
});
