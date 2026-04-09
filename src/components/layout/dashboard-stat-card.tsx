import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DashboardStatCardProps = {
  label: string;
  value: string;
  hint?: string;
  className?: string;
  valueClassName?: string;
};

export function DashboardStatCard({
  label,
  value,
  hint,
  className,
  valueClassName,
}: DashboardStatCardProps) {
  return (
    <Card
      className={cn(
        "animate-rise-fade-delay-2 relative overflow-hidden rounded-2xl border-border/60 bg-background/75 shadow-sm",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-primary/60 via-chart-1/40 to-transparent" />
      <CardContent className="space-y-2.5 p-4 md:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
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
