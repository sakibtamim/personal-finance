"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { AuthError } from "@/components/auth/auth-error";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithEmail, signInWithGoogle } from "@/lib/firebase/auth";
import { useAuthStore } from "@/store/use-auth-store";

export default function SignInPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsPending(true);

    try {
      const user = await signInWithEmail(email, password);
      setUser(user);
      router.push("/");
    } catch {
      setErrorMessage("Unable to sign in with email/password.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleGoogleSignIn() {
    setErrorMessage(null);
    setIsGooglePending(true);

    try {
      const user = await signInWithGoogle();
      setUser(user);
      router.push("/");
    } catch {
      setErrorMessage("Unable to sign in with Google.");
    } finally {
      setIsGooglePending(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to manage your monthly flow and savings."
      footerText="No account yet?"
      footerLinkHref="/auth/sign-up"
      footerLinkText="Create one"
    >
      <AuthError message={errorMessage} />
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <AuthSubmitButton label="Sign in" isPending={isPending} />
      </form>
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        disabled={isGooglePending}
        onClick={handleGoogleSignIn}
      >
        {isGooglePending ? "Signing in..." : "Continue with Google"}
      </Button>
      <Link
        href="/auth/reset-password"
        className="block text-sm text-muted-foreground"
      >
        Forgot password?
      </Link>
    </AuthShell>
  );
}
