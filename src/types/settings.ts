export const CURRENCY_OPTIONS = ["BDT", "USD", "EUR"] as const;
export type CurrencyCode = (typeof CURRENCY_OPTIONS)[number];

export const THEME_OPTIONS = ["light", "dark"] as const;
export type AppTheme = (typeof THEME_OPTIONS)[number];

export type UserSettings = {
  currency: CurrencyCode;
  theme: AppTheme;
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
  currency: "BDT",
  theme: "light",
};
