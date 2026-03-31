import {
  GoogleAuthProvider,
  type User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { auth } from "@/lib/firebase/client";
import type { AuthUser } from "@/types/auth";

const googleProvider = new GoogleAuthProvider();

export function mapFirebaseUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

export function subscribeToAuthState(
  callback: (user: AuthUser | null) => void,
): () => void {
  return onAuthStateChanged(auth, (user) => {
    callback(user ? mapFirebaseUser(user) : null);
  });
}

export async function signInWithGoogle(): Promise<AuthUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return mapFirebaseUser(result.user);
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthUser> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return mapFirebaseUser(result.user);
}

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<AuthUser> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return mapFirebaseUser(result.user);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}
