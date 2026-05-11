# Deployment Guide

This repository uses a self-hosted GitHub Actions deployment flow.

This file is the operational deployment guide. The dedicated implementation plan for the deployment architecture lives in [DEPLOYMENT_IMPLEMENTATION_PLAN.md](DEPLOYMENT_IMPLEMENTATION_PLAN.md).

## 1. Pre-deployment checks

Run these commands locally before shipping any commit:

```bash
pnpm install
pnpm predeploy:check
```

This runs:

- lint
- tests
- production build

## 2. Firebase rules deployment

Firestore rules and indexes are deployed manually:

```bash
pnpm firebase:login
pnpm firebase:use
pnpm firestore:deploy
```

If browser callback login fails, run:

```bash
pnpm dlx firebase-tools login --no-localhost --reauth
```

## 3. Runtime environment contract

The app depends on these Firebase public variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

These values must exist in two places for the deployment flow:

- **Build-time GitHub Actions secrets** — `pnpm build` reads them to inline `NEXT_PUBLIC_*` values
- **Runtime server `.env`** — the self-hosted app process must expose the same values

### GitHub Secrets

The deployment workflow also requires server connection secrets:

| Secret | Purpose |
|--------|---------|
| `SSH_HOST` | Server hostname or IP |
| `SSH_USERNAME` | SSH user for deployment |
| `SSH_KEY` | SSH private key |
| `SSH_TARGET` | Absolute path to the deployment directory |
| `SSH_PORT` | SSH port |
| `SSH_KNOWN_HOSTS` | Pinned host key fingerprint |

## 4. Firestore index workflow

- Keep [firestore.indexes.json](firestore.indexes.json) in source control. This file is the index blueprint for all environments.
- If Firestore query fails with an index error, open the "Create index" link from the error and create it in Firebase Console.
- After index creation, sync the latest indexes into [firestore.indexes.json](firestore.indexes.json) and commit the file.
- Deploy indexes with:

```bash
pnpm firestore:deploy
```

- If [firestore.indexes.json](firestore.indexes.json) is empty, the app currently uses default single-field indexes only.

## 5. App deployment workflow

The app is deployed via GitHub Actions when changes are pushed to the `deploy` branch.

### How it works

1. A push to `deploy` triggers the [deploy workflow](.github/workflows/deploy.yml).
2. The **build** job installs dependencies, injects Firebase env vars from secrets, and runs `pnpm build`.
3. The build produces a Next.js standalone artifact (`output: "standalone"` in `next.config.ts`).
4. `public/` and `.next/static/` are copied into the standalone folder along with `ecosystem.config.js`.
5. Everything is packaged into `deploy.tar.gz` and uploaded as a GitHub Actions artifact.
6. The **deploy** job downloads the artifact, generates a runtime `.env` from secrets, and uploads both to the server via SSH.
7. `scripts/deploy-remote.sh` runs on the server — it extracts the archive, preserves the `.env`, and restarts PM2.

### Branch promotion flow

To deploy the latest `develop` to production:

```bash
git fetch origin
git checkout deploy
git merge --ff-only origin/develop
git push origin deploy
```

This keeps deployment explicit — not every `develop` push ships automatically.

### Server prerequisites

The target server must have:

- Node.js 20.9+ or 22+
- PM2 installed globally for the deploy user
- A reverse proxy (e.g., nginx) forwarding to port 2304
- A deployment directory matching `SSH_TARGET`
- A reachable public domain pointing to the reverse proxy

## 6. Post-deploy smoke test

After each deployment, validate:

- [ ] Sign up, sign in, sign out
- [ ] Password reset email flow
- [ ] Save monthly values
- [ ] Spending rule quick expense flow
- [ ] Currency and theme persistence
- [ ] Data isolation across users

## 7. Follow-up automation tracks

These are planned improvements after the core deployment path is stable:

- **Firestore rules automation** — dedicated workflow triggered when `firestore.rules`, `firestore.indexes.json`, or `firebase.json` change
- **Rollback automation** — manual workflow dispatch to redeploy a previous artifact
- **Monitoring and alerting** — health check endpoint + scheduled uptime checks
- **Multi-environment promotion** — GitHub Environments with separate secrets for staging and production

## 8. Recommended hardening

- Replace Firestore test mode with stricter non-development settings if still enabled.
- Restrict Firebase Auth authorized domains to the real app domains.
- Enable App Check for stronger abuse protection.
- Add GitHub environment protections for the deployment job.
- Add monitoring and alerts in Firebase and on the hosting server.
