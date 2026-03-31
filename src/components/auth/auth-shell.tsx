import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AuthShellProps = {
  title: string;
  description: string;
  footerText?: string;
  footerLinkHref?: string;
  footerLinkText?: string;
  children: React.ReactNode;
};

export function AuthShell({
  title,
  description,
  footerText,
  footerLinkHref,
  footerLinkText,
  children,
}: AuthShellProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {children}
          {footerText && footerLinkHref && footerLinkText ? (
            <p className="text-sm text-muted-foreground">
              {footerText}{" "}
              <Link
                href={footerLinkHref}
                className="font-medium text-foreground"
              >
                {footerLinkText}
              </Link>
            </p>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
