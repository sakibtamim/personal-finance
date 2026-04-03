"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { DashboardLoadingSkeleton } from "@/components/dashboard/dashboard-loading-skeleton";
import { useAuthStore } from "@/store/use-auth-store";

type DashboardRouteGuardProps = {
  children: React.ReactNode;
};

export function DashboardRouteGuard({ children }: DashboardRouteGuardProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    if (status !== "loading" && !user) {
      router.replace("/auth/sign-in");
    }
  }, [router, status, user]);

  if (status === "loading" || !user) {
    return <DashboardLoadingSkeleton />;
  }

  return children;
}
