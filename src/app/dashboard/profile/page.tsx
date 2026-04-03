"use client";

import { useState } from "react";

import { DashboardAuthGate } from "@/components/dashboard/dashboard-auth-gate";
import { DashboardSection } from "@/components/layout/dashboard-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { signOutUser } from "@/lib/firebase/auth";
import { useAuthStore } from "@/store/use-auth-store";

function getAccountType(email: string | null): string {
  if (!email) {
    return "Google";
  }

  const domain = email.split("@")[1] ?? "";
  return domain === "gmail.com" ? "Google" : "Email";
}

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const clear = useAuthStore((state) => state.clear);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleLogout() {
    setIsSigningOut(true);

    try {
      await signOutUser();
      clear();
    } finally {
      setIsSigningOut(false);
    }
  }

  const profileRows = [
    { label: "Name", value: user?.displayName ?? "Not set" },
    { label: "Email", value: user?.email ?? "Not available" },
    { label: "Account type", value: getAccountType(user?.email ?? null) },
  ];

  return (
    <DashboardAuthGate>
      <DashboardSection
        title="Profile"
        description="Manage your account information and sign out securely."
      >
        <Card className="rounded-2xl border-border/50 bg-card shadow-sm">
          <CardContent className="space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border/50 bg-muted/20 p-3 sm:col-span-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Account status
                </p>
                <p className="mt-1 text-sm font-semibold">Active</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Plan
                </p>
                <p className="mt-1 text-sm font-semibold">Personal</p>
              </div>
            </div>

            {profileRows.map((row) => (
              <div
                key={row.label}
                className="space-y-1 rounded-xl border border-border/50 bg-background/80 p-3"
              >
                <p className="text-xs font-medium text-muted-foreground">
                  {row.label}
                </p>
                <p className="text-sm font-semibold">{row.value}</p>
              </div>
            ))}

            <Button
              variant="destructive"
              className="rounded-xl sm:w-fit"
              onClick={handleLogout}
              disabled={isSigningOut}
            >
              {isSigningOut ? "Signing out..." : "Logout"}
            </Button>
          </CardContent>
        </Card>
      </DashboardSection>
    </DashboardAuthGate>
  );
}
