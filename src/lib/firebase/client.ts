import { type FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import { getFirebaseClientEnv } from "@/lib/env";

let firebaseApp: FirebaseApp | null = null;

function getFirebaseApp(): FirebaseApp {
  if (firebaseApp) {
    return firebaseApp;
  }

  const firebaseConfig = getFirebaseClientEnv();
  firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

  return firebaseApp;
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export function getFirebaseDb() {
  return getFirestore(getFirebaseApp());
}
