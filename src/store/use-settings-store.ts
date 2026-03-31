import { create } from "zustand";

export type CurrencyCode = "BDT" | "USD" | "EUR";
export type AppTheme = "light" | "dark";

type SettingsState = {
  currency: CurrencyCode;
  theme: AppTheme;
  setCurrency: (currency: CurrencyCode) => void;
  setTheme: (theme: AppTheme) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  currency: "BDT",
  theme: "light",
  setCurrency: (currency) => set({ currency }),
  setTheme: (theme) => set({ theme }),
}));
