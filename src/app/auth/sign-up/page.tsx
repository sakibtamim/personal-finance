"use client";

import { Check, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { AuthError } from "@/components/auth/auth-error";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpWithEmail } from "@/lib/firebase/auth";
import { getFirebaseAuthErrorMessage } from "@/lib/firebase/error-messages";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/use-auth-store";

function evaluatePasswordStrength(password: string) {
  const checks = [
    { label: "At least 8 characters", passed: password.length >= 8 },
    { label: "At least one uppercase letter", passed: /[A-Z]/.test(password) },
    { label: "At least one lowercase letter", passed: /[a-z]/.test(password) },
    { label: "At least one number", passed: /\d/.test(password) },
    {
      label: "At least one special character",
      passed: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const score = checks.filter((check) => check.passed).length;

  if (score <= 1) {
    return { score, label: "Weak", color: "bg-red-500", checks };
  }

  if (score <= 3) {
    return { score, label: "Medium", color: "bg-amber-500", checks };
  }

  return { score, label: "Strong", color: "bg-emerald-500", checks };
}

export default function SignUpPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const passwordStrength = evaluatePasswordStrength(password);
  const meterWidth = `${(passwordStrength.score / 5) * 100}%`;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

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
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              minLength={6}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword((previous) => !previous)}
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {password.length > 0 ? (
            <div className="space-y-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-200",
                    passwordStrength.color,
                  )}
                  style={{ width: meterWidth }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Password strength:{" "}
                <span className="font-medium">{passwordStrength.label}</span>
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {passwordStrength.checks.map((check) => (
                  <li
                    key={check.label}
                    className={cn(
                      check.passed && "text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    {check.passed ? (
                      <Check
                        className="mr-1 inline-block size-3"
                        aria-hidden="true"
                      />
                    ) : (
                      "-"
                    )}{" "}
                    {check.label}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              name="confirm-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              minLength={6}
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword((previous) => !previous)}
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
        <AuthSubmitButton label="Create account" isPending={isPending} />
      </form>
    </AuthShell>
  );
}
