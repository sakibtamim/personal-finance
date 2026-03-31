"use client";

import { useEffect } from "react";

import { subscribeToAuthState } from "@/lib/firebase/auth";
import { useAuthStore } from "@/store/use-auth-store";

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const setUser = useAuthStore((state) => state.setUser);
  const setStatus = useAuthStore((state) => state.setStatus);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((user) => {
      setUser(user);
    });

    return () => {
      unsubscribe();
      setStatus("unauthenticated");
    };
  }, [setStatus, setUser]);

  return children;
}
