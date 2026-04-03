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
    <section className="space-y-4 md:space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-2 md:gap-3">
        <div className="space-y-1">
          <h1 className="text-[1.75rem] font-semibold tracking-tight md:text-[2rem]">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        {actions ? (
          <div className="flex items-center gap-2">{actions}</div>
        ) : null}
      </header>

      <Card className="rounded-2xl border-border/60 bg-card/95 shadow-sm">
        <CardContent className="space-y-4 p-4 md:p-5">{children}</CardContent>
      </Card>
    </section>
  );
}
