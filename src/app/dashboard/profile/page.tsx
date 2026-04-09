"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { DashboardAuthGate } from "@/components/dashboard/dashboard-auth-gate";
import { DashboardSection } from "@/components/layout/dashboard-section";
import { Button } from "@/components/ui/button";
import { DashboardStatCard } from "@/components/layout/dashboard-stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { IdCard, Mail, ShieldCheck, UserCircle2 } from "lucide-react";
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
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clear = useAuthStore((state) => state.clear);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleLogout() {
    setIsSigningOut(true);

    try {
      await signOutUser();
      clear();
      router.replace("/auth/sign-in");
    } finally {
      setIsSigningOut(false);
    }
  }

  const profileRows = [
    { label: "Name", value: user?.displayName ?? "Not set" },
    { label: "Email", value: user?.email ?? "Not available" },
    { label: "Account type", value: getAccountType(user?.email ?? null) },
  ];
  const displayName = user?.displayName?.trim() || "User";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DashboardAuthGate>
      <DashboardSection
        title="Profile"
        description="Review account identity, login method, and security status in one place."
        actions={
          <span className="inline-flex items-center rounded-full border border-indigo-500/35 bg-indigo-500/12 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.13em] text-indigo-700 dark:text-indigo-300">
            Secure account
          </span>
        }
      >
        <div className="animate-rise-fade-delay-1 grid gap-4 md:grid-cols-3">
          <DashboardStatCard
            label="Account"
            value={getAccountType(user?.email ?? null)}
            hint="Primary sign-in method"
            icon={IdCard}
            tone="indigo"
          />
          <DashboardStatCard
            label="Status"
            value="Verified"
            hint="Authentication is active"
            icon={ShieldCheck}
            tone="emerald"
          />
          <DashboardStatCard
            label="Plan"
            value="Personal"
            hint="Single user workspace"
            icon={Mail}
            tone="amber"
          />
        </div>

        <Card className="animate-rise-fade-delay-2 rounded-3xl border-indigo-500/25 bg-linear-to-br from-indigo-500/10 via-card/92 to-amber-500/8 shadow-sm">
          <CardContent className="space-y-5 p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/60 bg-background/75 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full border border-border/60 bg-card text-sm font-semibold">
                  {initials}
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Signed in as
                  </p>
                  <p className="mt-1 text-base font-semibold">{displayName}</p>
                </div>
              </div>
              <div className="ml-auto rounded-xl border border-border/60 bg-card/70 px-3 py-2 text-xs text-muted-foreground">
                Managed profile data
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {profileRows.map((row) => (
                <div
                  key={row.label}
                  className="space-y-1 rounded-2xl border border-border/60 bg-background/75 p-4"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {row.label}
                  </p>
                  <p className="text-sm font-semibold">{row.value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-background/75 p-4">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <ShieldCheck className="size-3.5" />
                  Account status
                </p>
                <p className="mt-1 text-sm font-semibold">
                  Active and verified
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/75 p-4">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <Mail className="size-3.5" />
                  Access channel
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {getAccountType(user?.email ?? null)} login
                </p>
              </div>
            </div>

            <Button
              variant="destructive"
              className="rounded-xl sm:w-fit"
              onClick={handleLogout}
              disabled={isSigningOut}
            >
              <UserCircle2 className="size-4" aria-hidden="true" />
              {isSigningOut ? "Signing out..." : "Sign out"}
            </Button>
          </CardContent>
        </Card>
      </DashboardSection>
    </DashboardAuthGate>
  );
}
