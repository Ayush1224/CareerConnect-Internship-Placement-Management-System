import fs from 'node:fs';
import path from 'node:path';

const fixturePath = path.resolve('test-results', 'e2e-fixtures.json');

export const fixtures = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

export const passwords = {
  student: 'E2EPassword-Student!2026',
  recruiter: 'E2EPassword-Recruiter!2026',
  admin: 'E2EPassword-Admin!2026'
};

export async function signIn(page, email, password) {
  await page.goto('/login');
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Login', exact: true }).click();
}

export async function expectUnauthorized(page, path) {
  await page.goto(path);
  await page.waitForURL('**/unauthorized');
  await page.getByRole('heading', { name: 'Access denied' }).waitFor();
}
