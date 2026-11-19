import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backendDir = path.join(rootDir, 'backend');
const fixturePath = path.join(rootDir, 'test-results', 'e2e-fixtures.json');

export default async function globalTeardown() {
  if (!fs.existsSync(fixturePath)) return;

  try {
    execFileSync(process.execPath, ['scripts/e2eFixtures.js', 'cleanup'], {
      cwd: backendDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        MONGO_DB_NAME: 'careerconnect_e2e_test'
      }
    });
  } finally {
    fs.rmSync(fixturePath, { force: true });
  }
}
