"use client";

import { useEffect } from "react";

import { subscribeToUserSettings } from "@/lib/firebase/settings";
import { useAuthStore } from "@/store/use-auth-store";
import { useSettingsStore } from "@/store/use-settings-store";

export function SettingsProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = useAuthStore((state) => state.user);
  const theme = useSettingsStore((state) => state.theme);
  const setSettings = useSettingsStore((state) => state.setSettings);
  const resetSettings = useSettingsStore((state) => state.resetSettings);

  useEffect(() => {
    if (!user) {
      resetSettings();
      return;
    }

    const unsubscribe = subscribeToUserSettings(user.uid, (settings) => {
      setSettings(settings);
    });

    return () => {
      unsubscribe();
    };
  }, [resetSettings, setSettings, user]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return children;
}
