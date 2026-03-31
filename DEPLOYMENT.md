# Deployment Guide

## 1. Pre-deployment checks

Run these commands locally:

```bash
pnpm install
pnpm predeploy:check
```

This runs:

- lint
- tests
- production build

## 2. Firebase rules deployment

Make sure Firestore rules and indexes are deployed:

```bash
pnpm firebase:login
pnpm firebase:use
pnpm firestore:deploy
```

## 3. Vercel environment variables

Add these variables in your Vercel project settings for Production and Preview:

- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID

## 4. Deploy to Vercel

```bash
pnpm deploy:vercel
```

## 5. Production smoke test

After deployment, validate:

- Sign up, sign in, sign out
- Password reset email flow
- Save monthly values
- Spending rule quick expense flow
- Currency and theme persistence
- Data isolation across users

## 6. Recommended post-launch hardening

- Replace Firestore test mode with stricter non-development settings if still enabled.
- Restrict Firebase Auth authorized domains to your real app domains.
- Enable App Check for stronger abuse protection.
- Set up monitoring and alerts in Firebase and your hosting provider.
