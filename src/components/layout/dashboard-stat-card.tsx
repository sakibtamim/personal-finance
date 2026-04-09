import type { ComponentType, SVGProps } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const toneStyles = {
  primary: {
    topBar: "from-cyan-500/90 via-sky-400/70 to-transparent",
    glow: "bg-cyan-500/15",
    iconWrap: "border-cyan-500/30 bg-cyan-500/12 text-cyan-600",
  },
  emerald: {
    topBar: "from-emerald-500/90 via-lime-400/70 to-transparent",
    glow: "bg-emerald-500/15",
    iconWrap: "border-emerald-500/30 bg-emerald-500/12 text-emerald-600",
  },
  rose: {
    topBar: "from-rose-500/90 via-fuchsia-400/70 to-transparent",
    glow: "bg-rose-500/15",
    iconWrap: "border-rose-500/30 bg-rose-500/12 text-rose-600",
  },
  amber: {
    topBar: "from-amber-500/90 via-orange-400/70 to-transparent",
    glow: "bg-amber-500/15",
    iconWrap: "border-amber-500/30 bg-amber-500/12 text-amber-600",
  },
  indigo: {
    topBar: "from-indigo-500/90 via-violet-400/70 to-transparent",
    glow: "bg-indigo-500/15",
    iconWrap: "border-indigo-500/30 bg-indigo-500/12 text-indigo-600",
  },
} as const;

type DashboardStatCardProps = {
  label: string;
  value: string;
  hint?: string;
  className?: string;
  valueClassName?: string;
  tone?: keyof typeof toneStyles;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
};

export function DashboardStatCard({
  label,
  value,
  hint,
  className,
  valueClassName,
  tone = "primary",
  icon: Icon,
}: DashboardStatCardProps) {
  const palette = toneStyles[tone];

  return (
    <Card
      className={cn(
        "animate-rise-fade-delay-2 relative overflow-hidden rounded-2xl border-border/60 bg-linear-to-br from-background/90 via-background/80 to-background/55 shadow-sm",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-linear-to-r",
          palette.topBar,
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute -right-6 top-6 h-20 w-20 rounded-full blur-2xl",
          palette.glow,
        )}
      />
      <CardContent className="space-y-2.5 p-4 md:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          {Icon ? (
            <span
              className={cn(
                "inline-flex size-7 items-center justify-center rounded-lg border",
                palette.iconWrap,
              )}
            >
              <Icon className="size-3.5" aria-hidden="true" focusable="false" />
            </span>
          ) : null}
        </div>
        <p
          className={cn(
            "text-2xl font-semibold leading-tight text-foreground md:text-[1.8rem]",
            valueClassName,
          )}
        >
          {value}
        </p>
        {hint ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
