type AuthErrorProps = {
  message: string | null;
};

export function AuthError({ message }: AuthErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {message}
    </p>
  );
}
