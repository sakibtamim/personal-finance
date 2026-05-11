# Deployment Implementation Plan

This document is the dedicated implementation plan for replacing the old Vercel-oriented deployment path with a minimal self-hosted GitHub Actions deployment flow for `personal-finance`.

## Goal

Deploy the Next.js app from GitHub Actions to a self-hosted server with the smallest practical setup:

- build on GitHub Actions
- ship an artifact to the server over SSH
- keep runtime secrets in GitHub Actions secrets
- restart the app with PM2
- keep Firestore rules deployment separate initially

## Scope

This plan covers:

- app deployment workflow
- server runtime configuration
- GitHub secrets contract
- branch promotion flow

The first implementation target is the core app deployment path only. The following items are planned follow-up automation tracks and are not blockers for the first successful self-hosted deploy:

- Firestore rules deployment
- rollback automation
- monitoring and alerting setup
- multi-environment promotion

## Current State

The repository now has:

- local pre-deploy verification via `pnpm predeploy:check`
- manual Firestore rules and indexes deployment via `pnpm firestore:deploy`
- GitHub Actions deployment workflow (`.github/workflows/deploy.yml`)
- PM2 runtime config (`ecosystem.config.js`)
- remote deploy script (`scripts/deploy-remote.sh`)
- Next.js standalone output (`output: "standalone"` in `next.config.ts`)

## Target Architecture

The target deployment path should work like this:

1. `develop` remains the working branch.
2. `deploy` is the branch that triggers shipping.
3. A push to `deploy` starts GitHub Actions.
4. GitHub Actions installs dependencies and runs `pnpm build`.
5. The workflow packages the standalone Next.js runtime artifact.
6. The workflow generates a runtime `.env` from GitHub secrets.
7. The workflow uploads the artifact and `.env` to the server over SSH.
8. A remote deploy script extracts the artifact, preserves runtime files, and restarts PM2.
9. A smoke check confirms the app is reachable.

## Design Choice

The deployment should follow the minimal `Purrfect-Software-Ltd-demo-` style and borrow only the useful hardening pieces from `mm-website`.

Adopt from the demo repo:

- simple `deploy` branch trigger
- build job plus deploy job
- SSH artifact upload
- PM2 restart on the server

Adopt from `mm-website`:

- Next.js standalone output
- runtime `.env` generated from GitHub secrets
- `SSH_KNOWN_HOSTS` pinning

Do not adopt from `mm-website`:

- Prisma
- Postgres service container
- Google service key generation
- monorepo packaging
- remote preflight script
- upload persistence logic

## Required Repo Changes

### 1. Update Next.js self-hosting config

File:

- [next.config.ts](C:/PU/personal-finance/next.config.ts:1)

Changes:

- add `output: "standalone"`
- optionally add `deploymentId` from an env such as `DEPLOYMENT_VERSION`

Why:

- Next.js standalone output creates a deployable runtime without installing the full dependency tree on the server
- `deploymentId` reduces version-skew risk during deploys

## 2. Add PM2 runtime config

File to add:

- `ecosystem.config.js`

Responsibilities:

- define the app name
- point PM2 at the built standalone `server.js`
- set `NODE_ENV=production`
- bind host and port

## 3. Add remote deploy script

File to add:

- `scripts/deploy-remote.sh`

Responsibilities:

- require `TARGET`
- preserve `.env`
- remove old extracted app files
- extract the uploaded archive
- ensure expected runtime paths exist
- restart PM2

## 4. Add GitHub Actions workflow

File to add:

- `.github/workflows/deploy.yml`

Trigger:

- push to `deploy`

Jobs:

- `build`
- `deploy`

### Build job

Responsibilities:

- checkout repo
- setup pnpm
- setup Node.js
- install dependencies
- inject Firebase env values for build
- run `pnpm build`
- package the standalone artifact
- upload build artifact

Artifact contents should include:

- `.next/standalone`
- `.next/static`
- `public`
- `ecosystem.config.js`

### Deploy job

Responsibilities:

- download artifact
- prepare runtime `.env`
- configure SSH key and known hosts
- upload artifact and `.env` to the server
- execute `scripts/deploy-remote.sh` remotely
- optionally check app readiness

## 5. Add runtime env generation

The workflow should generate the runtime `.env` from GitHub secrets during deploy instead of relying on a hand-maintained server file.

Current required app variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Important:

- these values are needed at build time
- the same values should also be present in the server runtime `.env`

## 6. Keep Firebase deploy separate initially

Do not combine Firestore rules deployment with the app deployment workflow in the first implementation.

Reason:

- it keeps failure modes separate
- it avoids adding Firebase service-account automation before the app workflow is stable
- the current manual command already exists and is documented

## Follow-up Automation Tracks

These items should be added after the core self-hosted deployment path is working end to end.

### Firestore rules deployment

Purpose:

- automatically deploy [firestore.rules](C:/PU/personal-finance/firestore.rules:1) and [firestore.indexes.json](C:/PU/personal-finance/firestore.indexes.json:1) when they change

Why it matters:

- prevents app code and Firebase security/index configuration from drifting apart

Recommended later approach:

- add a dedicated GitHub Actions workflow for Firestore deploys
- trigger it only when `firestore.rules`, `firestore.indexes.json`, or `firebase.json` changes
- use a dedicated Firebase service account secret instead of interactive login

### Rollback automation

Purpose:

- make it possible to redeploy the last known good release quickly

Why it matters:

- reduces recovery time when a bad build reaches the server

Recommended later approach:

- keep previous deploy artifacts on the server or in GitHub Actions artifacts
- add a manual workflow dispatch that redeploys a chosen commit or artifact
- document the exact rollback procedure in `DEPLOYMENT.md`

### Monitoring and alerting setup

Purpose:

- detect that the deployed app is unhealthy after release

Why it matters:

- deployment success alone does not prove the live app stays healthy

Recommended later approach:

- add a lightweight health check endpoint or smoke check target
- run scheduled uptime checks from GitHub Actions or an external monitor
- send alerts through the channel you already use operationally

### Multi-environment promotion

Purpose:

- separate staging and production deployment flows cleanly

Why it matters:

- reduces risk by letting changes prove themselves in staging before production promotion

Recommended later approach:

- use GitHub Environments such as `staging` and `production`
- keep environment-specific secrets separate
- promote from `develop` to `deploy` or from `deploy` to `main` using an explicit release step

## Required GitHub Secrets

App secrets:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Server secrets:

- `SSH_HOST`
- `SSH_USERNAME`
- `SSH_KEY`
- `SSH_TARGET`
- `SSH_PORT`
- `SSH_KNOWN_HOSTS`

## Required Server Prerequisites

The target server should already have:

- Node.js `20.9+` or `22+`
- PM2 installed for the deploy user
- a reverse proxy such as nginx
- a deployment directory that matches `SSH_TARGET`
- a reachable public domain pointing to the reverse proxy

## Branch Promotion Workflow

The `deploy` branch is created and tracked on the remote. Pushing to it triggers the GitHub Actions deployment workflow.

Release flow:

```bash
git fetch origin
git checkout deploy
git merge --ff-only origin/develop
git push origin deploy
```

Always use `--ff-only` to keep the `deploy` branch history clean and linear.

That keeps deployment explicit and avoids shipping every `develop` push automatically.

## Implementation Order

Recommended sequence:

1. ~~Update `next.config.ts` for standalone output.~~ ✅
2. ~~Add `ecosystem.config.js`.~~ ✅
3. ~~Add `scripts/deploy-remote.sh`.~~ ✅
4. ~~Add `.github/workflows/deploy.yml`.~~ ✅
5. Configure GitHub secrets.
6. Prepare the server.
7. Test a first deploy from `deploy`.
8. Add a smoke check once the core path works.

## Acceptance Criteria

The deployment implementation is complete when:

- a push to `deploy` triggers GitHub Actions
- GitHub Actions builds successfully using repo secrets
- the server receives the artifact and `.env`
- PM2 starts the deployed app successfully
- the app loads through the public domain
- auth and Firestore-backed flows still work

## First Post-Deploy Validation

After the first successful deploy, validate:

- sign up
- sign in
- sign out
- password reset flow
- save monthly values
- spending rule quick expense flow
- theme persistence
- user data isolation

## Follow-up Improvements

After the minimal path is stable, consider:

- adding GitHub environment protections
- adding deployment rollback notes
- automating Firestore rules deployment
- adding server health checks and alerts
- documenting nginx and DNS setup
