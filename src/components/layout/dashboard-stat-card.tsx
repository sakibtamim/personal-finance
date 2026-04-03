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
        "rounded-xl border-border/50 bg-background/80 shadow-sm",
        className,
      )}
    >
      <CardContent className="space-y-2.5 p-4 md:p-5">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p
          className={cn("text-3xl font-semibold leading-tight", valueClassName)}
        >
          {value}
        </p>
        {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
