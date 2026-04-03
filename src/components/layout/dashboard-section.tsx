import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

type DashboardSectionProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function DashboardSection({
  title,
  description,
  actions,
  children,
}: DashboardSectionProps) {
  return (
    <section className="space-y-5 md:space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-2 md:gap-3">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {title}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        {actions ? (
          <div className="flex items-center gap-2">{actions}</div>
        ) : null}
      </header>

      <Card className="rounded-2xl border-border/50 bg-card shadow-sm">
        <CardContent className="space-y-4 p-4 md:p-5">{children}</CardContent>
      </Card>
    </section>
  );
}
