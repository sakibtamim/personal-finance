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
    <section className="animate-rise-fade space-y-5 md:space-y-6">
      <header className="relative overflow-hidden rounded-3xl border border-border/60 bg-linear-to-br from-card/95 via-card/88 to-card/78 p-5 shadow-sm backdrop-blur-sm md:p-7">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-8 top-0 h-28 w-28 rounded-full bg-cyan-500/20 blur-2xl" />
          <div className="absolute right-12 top-6 h-20 w-20 rounded-full bg-amber-400/20 blur-2xl" />
          <div className="absolute -right-6 bottom-0 h-24 w-24 rounded-full bg-emerald-500/20 blur-2xl" />
        </div>
        <div className="relative flex flex-wrap items-end justify-between gap-2 md:gap-3">
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/85">
              Financial command center
            </p>
            <h1 className="text-[1.75rem] font-semibold tracking-tight text-foreground md:text-[2.1rem]">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-[0.95rem]">
              {description}
            </p>
          </div>
          {actions ? (
            <div className="flex items-center gap-2">{actions}</div>
          ) : null}
        </div>
      </header>

      <Card className="animate-rise-fade-delay-1 rounded-3xl border-border/60 bg-linear-to-br from-card/95 via-card/88 to-card/80 shadow-sm backdrop-blur-sm">
        <CardContent className="space-y-4 p-4 md:p-6">{children}</CardContent>
      </Card>
    </section>
  );
}
