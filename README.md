# CareerConnect

CareerConnect is a MERN job platform with student, company, and admin experiences. Its demo flow covers company onboarding and job posting, student applications, applicant review, interview scheduling, notifications, and company verification.

## Requirements

- Node.js 22.12 or newer and npm.
- A MongoDB Atlas cluster and a database user with `readWrite` access to `careerconnect_portfolio_demo` and `careerconnect_auth_test`.
- Atlas network access enabled for your current IP address.

## Clean local setup

Run these commands in PowerShell. Set `$repo` to the folder where you cloned this project:

```powershell
$repo = 'C:\path\to\CareerConnect'
Set-Location $repo
npm ci
Set-Location (Join-Path $repo 'backend')
npm ci
Set-Location $repo
Copy-Item .env.example .env
Copy-Item (Join-Path $repo 'backend\.env.example') (Join-Path $repo 'backend\.env')
notepad (Join-Path $repo 'backend\.env')
```

In `backend\.env`, replace every placeholder before seeding or starting the backend:

- `MONGO_URI`: paste the Atlas connection string and replace the Atlas username, URL-encoded password, and cluster host. Keep the URI only in this ignored local file.
- `MONGO_DB_NAME` and `DEMO_DB_NAME`: keep both set to `careerconnect_portfolio_demo` for the portfolio demo. The seed scripts reject a missing demo database, a name that is not recognizably a demo database, a mismatch between these variables, and `careerconnect` or `careerconnect_auth_test`.
- `JWT_SECRET`: use a long, unique random value.
- `SEED_PASSWORD`: use a strong password of at least 12 characters for the fictional student and company accounts.
- `ADMIN_PASSWORD`: set a separate strong password of at least 12 characters.
- `DEMO_STUDENT_EMAIL`, `DEMO_COMPANY_EMAIL`, and `ADMIN_EMAIL`: use fictional email addresses that you control only if you intend to receive email; the `.example`/`.invalid` values in the example are non-deliverable.

`backend\.env.example` contains placeholders, not usable secrets. The root `.env.example` configures the Vite API base URL (`http://localhost:5000`). The root `.env` and `backend\.env` are ignored by Git; do not commit them. In the demo workflow, the seed scripts require `DEMO_DB_NAME` and ensure it matches `MONGO_DB_NAME`; they reject the production and auth-test database names. The admin seeder also supports non-demo provisioning, but only when `MONGO_DB_NAME` is explicitly set. If an Atlas URI was committed previously, rotate that database user's password in Atlas—the updated example file does not erase repository history.

The demo seeder creates only the demo student and company accounts plus the student's fictional profile; it intentionally leaves the company profile empty for onboarding. Run both seeders from the backend folder:

```powershell
$repo = 'C:\path\to\CareerConnect'
Set-Location (Join-Path $repo 'backend')
npm run seed:demo
npm run seed:admin
```

The student and company sign in with their respective email values from `backend\.env` and the `SEED_PASSWORD`. The admin uses `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Seed operations are insert-only/upsert based: rerunning them does not reset existing account passwords or overwrite completed company onboarding. The existing `npm run seed` command remains available for an expanded fictional sample dataset; it also requires the dedicated demo database and is optional. Skip it for the guided onboarding walkthrough below.

## Start the apps

Use separate PowerShell terminals. Default ports are **5000** for Express and **5173** for Vite.

Backend terminal:

```powershell
$repo = 'C:\path\to\CareerConnect'
Set-Location (Join-Path $repo 'backend')
$env:PORT = '5000'
$env:MONGO_DB_NAME = 'careerconnect_portfolio_demo'
$env:CLIENT_URL = 'http://localhost:5173'
npm run dev
```

Frontend terminal:

```powershell
$repo = 'C:\path\to\CareerConnect'
Set-Location $repo
$env:VITE_API_BASE_URL = 'http://localhost:5000'
npm run dev
```

Open `http://localhost:5173`. If a default port is occupied, use a matching alternate pair. For example, set backend `PORT` to `5001`, backend `CLIENT_URL` to `http://localhost:5174`, frontend `VITE_API_BASE_URL` to `http://localhost:5001`, then start Vite with:

```powershell
npm run dev -- --port 5174 --strictPort
```

## Demo walkthrough

Use the fictional accounts seeded above. Log out before switching roles, or use separate browser profiles.

1. **Company onboarding and job posting:** Sign in with `DEMO_COMPANY_EMAIL` and `SEED_PASSWORD`. Open **Company Profile**, complete the company name, industry, location, website, and contact email, then save. Open **Manage Jobs**, choose **Post a new job**, enter a title, description, location, and future application deadline, keep the status **Active**, and publish.
2. **Student applies:** Sign in with `DEMO_STUDENT_EMAIL` and `SEED_PASSWORD`. Open **Browse Jobs**, open the job just published, and submit an application. A cover letter is optional; the seeded student profile is available to the applicant review flow.
3. **Company reviews and schedules:** Sign back in as the company. From **Manage Jobs**, open **View applicants** for the new job. Change the application status to **Shortlisted**. In the applicant card's **Interviews** section, choose a future date and time, optionally add a meeting link, and schedule the interview.
4. **Student sees the update:** Sign in as the student. Open **My Interviews** to see the scheduled interview and **Notifications** to see the interview notification. Choose **Mark as read** and confirm the unread count changes.
5. **Admin review:** Sign in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Review platform counts on **Admin dashboard**, then open **Manage Companies** and verify the completed company profile.

All people, organizations, jobs, and application details used in this walkthrough are fictional. No screenshots are included in the repository.

## Private staging deployment

The staging database name is `careerconnect_staging_demo`. Create it in Atlas using a dedicated database user limited to that database. Do not reuse `careerconnect`, `careerconnect_auth_test`, or `careerconnect_portfolio_demo`. Atlas creates a database when the first collection is written. Allow the backend host's outbound IP addresses in Atlas Network Access; avoid broad IP ranges where the host provides stable egress addresses.

### Cloudflare Pages frontend

Connect the repository to Cloudflare Pages with these build settings:

- Framework preset: **Vite**
- Root directory: repository root
- Build command: `npm ci && npm run build`
- Build output directory: `dist`
- Node.js version: `22.12` or newer
- Build environment variable: `VITE_API_BASE_URL=https://<your-api-host>`

The frontend reads `VITE_API_BASE_URL` at build time and appends `/api` when needed. Never put `MONGO_URI`, `JWT_SECRET`, or admin credentials in Cloudflare Pages build variables. `public/_redirects` contains the SPA fallback so direct links and browser reloads resolve through `index.html`.

For private access, configure a Cloudflare Access application and allow policy for the staging frontend domain. Protect the API at its hosting edge as well if staging must be private; frontend-only protection does not secure API endpoints. Verify that any API access layer is compatible with cross-origin browser requests from the exact Pages origin.

### Express Node.js service

The Node service host has not been selected. Configure the service from the repository's `backend` directory (or set its working directory to `backend`) with:

- Install command: `npm ci`
- Build command: none
- Start command: `npm start` (runs `node server.js`)
- Runtime: Node.js 22.12 or newer
- Let the host provide `PORT`; Express listens on `0.0.0.0` and uses that value.

Set these variables in the backend host's private environment/secret manager:

| Variable | Value |
| --- | --- |
| `MONGO_URI` | Atlas connection string; secret |
| `MONGO_DB_NAME` | `careerconnect_staging_demo` |
| `JWT_SECRET` | Unique, cryptographically random staging secret; secret |
| `JWT_EXPIRES_IN` | `1d` or the desired staging lifetime |
| `CLIENT_URL` | Exact deployed frontend origin, e.g. `https://<your-pages-domain>`; no path or trailing slash |
| `NODE_ENV` | `production` |
| `PORT` | Host-provided; do not hard-code a production port |

`MONGO_URI` and `JWT_SECRET` belong only in the backend service environment. Restrict Atlas network access to the service egress where possible. Do not commit credentials, include them in frontend variables, or share seeded admin credentials in deployment logs.

### Fictional staging accounts and index check

After confirming the backend environment points to the dedicated staging database, run the existing safe seeders from a trusted operator environment (or a protected one-off job). Set `DEMO_DB_NAME` to the same staging database name, and provide fictional emails and strong passwords through a secret manager or local ignored environment file:

```powershell
Set-Location 'C:\path\to\CareerConnect\backend'
$env:MONGO_DB_NAME = 'careerconnect_staging_demo'
$env:DEMO_DB_NAME = 'careerconnect_staging_demo'
$env:SEED_PASSWORD = '<private fictional student/company password>'
$env:DEMO_STUDENT_NAME = 'Avery Shah'
$env:DEMO_STUDENT_EMAIL = 'avery.student@demo.invalid'
$env:DEMO_COMPANY_NAME = 'Northstar Labs Recruiter'
$env:DEMO_COMPANY_EMAIL = 'recruiter@northstar.example'
npm run seed:demo
$env:ADMIN_NAME = 'CareerConnect Staging Admin'
$env:ADMIN_EMAIL = '<private staging admin email>'
$env:ADMIN_PASSWORD = '<private unique admin password>'
npm run seed:admin
npm run verify:staging-indexes
```

The admin password and email above are placeholders; keep their actual values private and do not put them in source control or frontend settings. The index verifier is read-only and refuses to inspect any database other than `careerconnect_staging_demo`. It checks the unique compound `applications(studentId, jobId)` index and the unique partial `notifications(dedupeKey)` index used for interview request idempotency. It does not create or alter indexes.

### Deployment smoke checks

After both services are deployed:

1. Request `https://<your-api-host>/api/health` and confirm HTTP 200 with `success: true`.
2. Open and reload direct frontend URLs such as `/student/dashboard`, `/company/dashboard`, and `/admin/dashboard`; each should render the SPA and then restore its authenticated session.
3. Use only fictional staging accounts to walk through company profile/job publishing, student application, company shortlist/interview scheduling, student notification/read state, and admin company verification.
4. Confirm CORS works from the exact frontend origin, the staging database is selected in backend logs, and no secret appears in client bundles or logs.

The staging services are not deployed from this workspace: choose a Node.js host, create the Cloudflare Pages project/domain, configure secrets and Atlas network access, and share the resulting frontend/API URLs before live health, direct-reload, and three-role staging verification can be completed.

## Build and backend tests

Run the frontend production build from the repository root:

```powershell
$repo = 'C:\path\to\CareerConnect'
Set-Location $repo
npm run build
```

Run the HTTP regression suites from the backend folder. These test files use `careerconnect_auth_test`; they do not use the portfolio demo database:

```powershell
$repo = 'C:\path\to\CareerConnect'
Set-Location (Join-Path $repo 'backend')
npm run test:auth
npm run test:admin
npm run test:jobs
npm run test:applications
npm run test:interviews
npm run test:seeders
```

`npm run test:seeders` checks that the demo seed scripts reject an unselected database, the production database, the auth-test database, and conflicting database settings. The legacy `npm test` command runs `databaseTest.js`, which validates the separate `careerconnect` database and its fixed verification fixtures; it is not the HTTP regression suite and should not be redirected to the portfolio demo database.
