"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { signOutUser } from "@/lib/firebase/auth";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/use-auth-store";

export function HomeAuthPanel() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const clear = useAuthStore((state) => state.clear);

  async function handleSignOut() {
    await signOutUser();
    clear();
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 items-center px-4 py-10">
      <div className="w-full rounded-2xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Personal Finance</h1>
        <p className="mt-2 text-muted-foreground">
          Auth UI is now ready. Firestore finance modules will be added in the
          next step.
        </p>

        <div className="mt-6 space-y-3">
          <p className="text-sm">
            Status: <span className="font-medium">{status}</span>
          </p>
          <p className="text-sm">
            User:{" "}
            <span className="font-medium">
              {user?.email ?? "Not signed in"}
            </span>
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/auth/sign-in" className={cn(buttonVariants())}>
            Sign in
          </Link>
          <Link
            href="/auth/sign-up"
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            Sign up
          </Link>
          <Link
            href="/auth/reset-password"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Reset password
          </Link>
          <Button variant="destructive" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
