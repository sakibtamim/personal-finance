import Image from "next/image";
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
          <div className="mb-1 flex items-center gap-2">
            <span className="relative inline-flex size-8 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-background shadow-sm">
              <Image
                src="/logo.png"
                alt="Finance Hub"
                fill
                sizes="32px"
                className="object-cover scale-[1]"
                priority
              />
            </span>
            <span className="text-xs font-semibold tracking-wide text-muted-foreground">
              Finance Hub
            </span>
          </div>
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
