import type { FirebaseError } from "firebase/app";

const authErrorMessages: Record<string, string> = {
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/missing-password": "Password is required.",
  "auth/invalid-credential": "Email or password is incorrect.",
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Email or password is incorrect.",
  "auth/email-already-in-use": "This email is already in use.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/popup-closed-by-user": "Google sign-in was cancelled.",
  "auth/popup-blocked": "Browser blocked the sign-in popup.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/network-request-failed":
    "Network error. Check your internet and retry.",
};

export function getFirebaseAuthErrorMessage(
  error: unknown,
  fallback: string,
): string {
  const firebaseError = error as FirebaseError | undefined;

  if (!firebaseError?.code) {
    return fallback;
  }

  return authErrorMessages[firebaseError.code] ?? fallback;
}
