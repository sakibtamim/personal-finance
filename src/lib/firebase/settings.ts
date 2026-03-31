import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";

import { getFirebaseDb } from "@/lib/firebase/client";
import {
  CURRENCY_OPTIONS,
  DEFAULT_USER_SETTINGS,
  THEME_OPTIONS,
  type UserSettings,
} from "@/types/settings";

type SettingsDoc = {
  currency?: string;
  theme?: string;
};

function userSettingsDocRef(uid: string) {
  const db = getFirebaseDb();
  return doc(db, "users", uid, "settings", "preferences");
}

function isCurrencyCode(value: string): value is UserSettings["currency"] {
  return CURRENCY_OPTIONS.includes(value as UserSettings["currency"]);
}

function isAppTheme(value: string): value is UserSettings["theme"] {
  return THEME_OPTIONS.includes(value as UserSettings["theme"]);
}

function normalizeSettings(data?: SettingsDoc): UserSettings {
  const currency = data?.currency ?? DEFAULT_USER_SETTINGS.currency;
  const theme = data?.theme ?? DEFAULT_USER_SETTINGS.theme;

  return {
    currency: isCurrencyCode(currency)
      ? currency
      : DEFAULT_USER_SETTINGS.currency,
    theme: isAppTheme(theme) ? theme : DEFAULT_USER_SETTINGS.theme,
  };
}

export function subscribeToUserSettings(
  uid: string,
  callback: (settings: UserSettings) => void,
): () => void {
  return onSnapshot(userSettingsDocRef(uid), (snapshot) => {
    if (!snapshot.exists()) {
      callback(DEFAULT_USER_SETTINGS);
      return;
    }

    callback(normalizeSettings(snapshot.data() as SettingsDoc));
  });
}

export async function upsertUserSettings(
  uid: string,
  settings: Partial<UserSettings>,
): Promise<void> {
  await setDoc(
    userSettingsDocRef(uid),
    {
      ...settings,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
