# Deployment Guide

This repository no longer uses a Vercel deployment path.

This file is the operational deployment guide. The dedicated implementation plan for the new self-hosted GitHub Actions deployment flow lives in [DEPLOYMENT_IMPLEMENTATION_PLAN.md](C:/PU/personal-finance/DEPLOYMENT_IMPLEMENTATION_PLAN.md:1).

## 1. Current pre-deployment checks

Run these commands locally before shipping any commit:

```bash
pnpm install
pnpm predeploy:check
```

This runs:

- lint
- tests
- production build

## 2. Current Firebase rules deployment

Firestore rules and indexes are still deployed manually:

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

The app currently depends on these Firebase public variables:

- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID

These values must exist in two places for the future GitHub Actions deployment flow:

- build-time GitHub Actions secrets, because `pnpm build` reads them
- runtime server `.env`, because the self-hosted app process must expose the same values

## 4. Firestore index workflow

- Keep [firestore.indexes.json](firestore.indexes.json) in source control. This file is the index blueprint for all environments.
- If Firestore query fails with an index error, open the "Create index" link from the error and create it in Firebase Console.
- After index creation, sync the latest indexes into [firestore.indexes.json](firestore.indexes.json) and commit the file.
- Deploy indexes with:

```bash
pnpm firestore:deploy
```

- If [firestore.indexes.json](firestore.indexes.json) is empty, the app currently uses default single-field indexes only.

## 5. Planned self-hosted app deployment

The future deployment target is a minimal self-hosted GitHub Actions workflow built around:

- a `deploy` branch trigger
- build artifact creation on GitHub Actions
- SSH upload to the server
- PM2-managed runtime restart

The first phase focuses on getting the core app deploy working. Firestore automation, rollback automation, monitoring, and multi-environment promotion are planned follow-up tracks and are documented in [DEPLOYMENT_IMPLEMENTATION_PLAN.md](C:/PU/personal-finance/DEPLOYMENT_IMPLEMENTATION_PLAN.md:1).

## 6. Post-deploy smoke test

After the self-hosted deployment is live, validate:

- Sign up, sign in, sign out
- Password reset email flow
- Save monthly values
- Spending rule quick expense flow
- Currency and theme persistence
- Data isolation across users

## 7. Recommended hardening after the workflow exists

- Replace Firestore test mode with stricter non-development settings if still enabled.
- Restrict Firebase Auth authorized domains to the real app domains.
- Enable App Check for stronger abuse protection.
- Add GitHub environment protections for the deployment job.
- Add monitoring and alerts in Firebase and on the hosting server.
