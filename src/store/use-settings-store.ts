import { create } from "zustand";

import {
  DEFAULT_USER_SETTINGS,
  type AppTheme,
  type CurrencyCode,
  type UserSettings,
} from "@/types/settings";

type SettingsState = {
  currency: CurrencyCode;
  theme: AppTheme;
  setSettings: (settings: UserSettings) => void;
  setCurrency: (currency: CurrencyCode) => void;
  setTheme: (theme: AppTheme) => void;
  resetSettings: () => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  currency: DEFAULT_USER_SETTINGS.currency,
  theme: DEFAULT_USER_SETTINGS.theme,
  setSettings: (settings) =>
    set({ currency: settings.currency, theme: settings.theme }),
  setCurrency: (currency) => set({ currency }),
  setTheme: (theme) => set({ theme }),
  resetSettings: () =>
    set({
      currency: DEFAULT_USER_SETTINGS.currency,
      theme: DEFAULT_USER_SETTINGS.theme,
    }),
}));
