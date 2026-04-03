import Link from "next/link";

import { DASHBOARD_NAV_ITEMS } from "@/components/layout/dashboard-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <Card className="rounded-2xl border-border/80 bg-card/95 shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Choose a section to view the new UI placeholders.
        </p>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {DASHBOARD_NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <Button
                key={item.href}
                asChild
                variant="secondary"
                className="h-11 justify-start gap-2 rounded-xl"
              >
                <Link href={item.href}>
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
