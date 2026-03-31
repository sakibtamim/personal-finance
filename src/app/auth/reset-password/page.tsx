"use client";

import { FormEvent, useState } from "react";

import { AuthError } from "@/components/auth/auth-error";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/firebase/auth";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsPending(true);

    try {
      await resetPassword(email);
      setSuccessMessage("Password reset email sent.");
    } catch {
      setErrorMessage("Unable to send password reset email.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AuthShell
      title="Reset password"
      description="We will send a password reset link to your email."
      footerText="Remembered your password?"
      footerLinkHref="/auth/sign-in"
      footerLinkText="Back to sign in"
    >
      <AuthError message={errorMessage} />
      {successMessage ? (
        <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
          {successMessage}
        </p>
      ) : null}
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
        <AuthSubmitButton label="Send reset email" isPending={isPending} />
      </form>
    </AuthShell>
  );
}
