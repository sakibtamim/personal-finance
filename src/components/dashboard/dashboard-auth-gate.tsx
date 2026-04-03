"use client";

import Link from "next/link";

import { DashboardLoadingSkeleton } from "@/components/dashboard/dashboard-loading-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/use-auth-store";

type DashboardAuthGateProps = {
  children: React.ReactNode;
};

export function DashboardAuthGate({ children }: DashboardAuthGateProps) {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);

  if (status === "loading") {
    return <DashboardLoadingSkeleton />;
  }

  if (!user) {
    return (
      <Card className="rounded-2xl border-border/80 bg-card/95">
        <CardContent className="space-y-4 p-6">
          <p className="text-sm text-muted-foreground">
            Sign in to access dashboard features.
          </p>
          <Button asChild className="rounded-xl">
            <Link href="/auth/sign-in">Go to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return children;
}
