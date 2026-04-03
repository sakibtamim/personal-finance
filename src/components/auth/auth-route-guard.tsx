"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/use-auth-store";

type AuthRouteGuardProps = {
  children: React.ReactNode;
};

export function AuthRouteGuard({ children }: AuthRouteGuardProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    if (status !== "loading" && user) {
      router.replace("/dashboard");
    }
  }, [router, status, user]);

  if (status === "loading" || user) {
    return null;
  }

  return children;
}
