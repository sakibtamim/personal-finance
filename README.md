This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Setup (Step 3)

Create a local env file from the example and fill in your Firebase project keys:

```bash
cp .env.example .env.local
```

Required variables are listed in `.env.example`.

## Auth Foundation (Step 4)

Implemented Firebase Auth foundation with:

- Google sign-in
- Email/password sign-in and sign-up
- Password reset
- Real-time auth state subscription

Key files:

- `src/lib/firebase/auth.ts`
- `src/store/use-auth-store.ts`
- `src/components/providers/auth-provider.tsx`

## Auth UI (Step 5)

Implemented auth pages and form flows:

- `/auth/sign-in` (email/password + Google)
- `/auth/sign-up` (email/password)
- `/auth/reset-password` (email reset link)

The homepage now displays live auth state and quick navigation actions.

## Firestore Monthly Flow (Step 6)

Implemented real-time finance module for authenticated users:

- Monthly fields: `income`, `expense`, `manualSaved`, `manualWithdrawn`
- Remaining formula: `income - expense`
- Total savings formula: sum of all months as
  `(income - expense + manualSaved - manualWithdrawn)`

Key files:

- `src/lib/firebase/finance.ts`
- `src/types/finance.ts`
- `src/components/auth/home-auth-panel.tsx`

## User Settings (Step 7)

Implemented required user settings with Firestore persistence:

- Currency setting (`BDT` default)
- Theme setting (`light`/`dark`)
- Real-time sync from Firestore settings document
- Theme class application on the root document

Key files:

- `src/lib/firebase/settings.ts`
- `src/types/settings.ts`
- `src/store/use-settings-store.ts`
- `src/components/providers/settings-provider.tsx`
- `src/components/auth/home-auth-panel.tsx`

## Spending Rule (Step 8)

Implemented expense application rule:

- Spend from current month remaining first
- If remaining is insufficient, consume savings
- Reject expense when total available funds are insufficient
- Live preview of expense source split (current month vs savings)

Key files:

- `src/lib/firebase/finance.ts`
- `src/components/auth/home-auth-panel.tsx`

## Firestore Security Rules (Step 9)

Added strict user-isolation rules for Firestore:

- Users can only read/write their own data under `users/{uid}`
- Monthly flow values must be non-negative numbers
- Settings values are constrained to allowed enums (`currency`, `theme`)
- Unknown fields are blocked for protected documents

Files added:

- `firestore.rules`
- `firestore.indexes.json`
- `firebase.json`

Deploy rules and indexes:

```bash
pnpm dlx firebase-tools login
pnpm dlx firebase-tools use personal-finance-17ca1
pnpm dlx firebase-tools deploy --only firestore:rules,firestore:indexes
```

## UX Hardening (Step 10)

Implemented UX reliability improvements:

- Firebase auth error-code mapping to user-friendly messages
- Non-negative finance input validation before save/apply actions
- Disabled action buttons for invalid states
- Empty-state hint when no monthly finance data exists

Key files:

- `src/lib/firebase/error-messages.ts`
- `src/app/auth/sign-in/page.tsx`
- `src/app/auth/sign-up/page.tsx`
- `src/app/auth/reset-password/page.tsx`
- `src/components/auth/home-auth-panel.tsx`

## Testing (Step 11)

Added automated unit tests with Vitest:

- Finance calculation coverage (`remaining`, `net contribution`, spending split)
- Month id format coverage (`YYYY-MM`)
- Firebase auth error message mapping coverage

Files added:

- `vitest.config.ts`
- `src/lib/firebase/finance.test.ts`
- `src/lib/firebase/error-messages.test.ts`

Run tests:

```bash
pnpm test:run
pnpm test:coverage
```

## Deployment (Step 12)

Production deployment workflow is now documented and scripted:

- Pre-deploy verification script (`lint + tests + build`)
- Firestore rules deployment scripts
- Vercel production deployment script
- Post-deploy smoke-test checklist

Key files:

- `DEPLOYMENT.md`
- `package.json`

Main commands:

```bash
pnpm predeploy:check
pnpm firestore:deploy
pnpm deploy:vercel
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
