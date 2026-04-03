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
      className={cn("rounded-xl border-border/60 bg-background/70", className)}
    >
      <CardContent className="space-y-1.5 p-4 md:p-5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "text-2xl font-semibold leading-tight md:text-[1.75rem]",
            valueClassName,
          )}
        >
          {value}
        </p>
        {hint ? (
          <p className="pt-0.5 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
