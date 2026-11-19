import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backendDir = path.join(rootDir, 'backend');

export default async function globalSetup() {
  const runId = randomUUID();
  process.env.E2E_RUN_ID = runId;
  execFileSync(process.execPath, ['scripts/e2eFixtures.js', 'setup'], {
    cwd: backendDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      E2E_RUN_ID: runId,
      MONGO_DB_NAME: 'careerconnect_e2e_test'
    }
  });
}
