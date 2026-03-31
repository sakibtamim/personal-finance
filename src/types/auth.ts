export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};
