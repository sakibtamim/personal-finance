"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { AuthError } from "@/components/auth/auth-error";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpWithEmail } from "@/lib/firebase/auth";
import { getFirebaseAuthErrorMessage } from "@/lib/firebase/error-messages";
import { useAuthStore } from "@/store/use-auth-store";

export default function SignUpPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsPending(true);

    try {
      const user = await signUpWithEmail(email, password);
      setUser(user);
      router.push("/");
    } catch (error) {
      setErrorMessage(
        getFirebaseAuthErrorMessage(error, "Unable to create account."),
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AuthShell
      title="Create account"
      description="Set up your personal finance workspace."
      footerText="Already have an account?"
      footerLinkHref="/auth/sign-in"
      footerLinkText="Sign in"
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
            autoComplete="new-password"
            minLength={6}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <AuthSubmitButton label="Create account" isPending={isPending} />
      </form>
    </AuthShell>
  );
}
