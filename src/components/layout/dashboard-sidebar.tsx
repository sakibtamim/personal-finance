"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Landmark } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DASHBOARD_NAV_ITEMS } from "@/components/layout/dashboard-navigation";
import { cn } from "@/lib/utils";

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border/60 bg-card/85 px-4 py-5 backdrop-blur md:block">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 px-2">
          <span className="inline-flex size-8 items-center justify-center rounded-lg border border-border/60 bg-background shadow-sm">
            <Landmark className="size-4" aria-hidden="true" />
          </span>
          <span className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
            Finance Hub
          </span>
        </div>

        <nav
          className="mt-7 flex flex-1 flex-col gap-1.5"
          aria-label="Main navigation"
        >
          {DASHBOARD_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Button
                key={item.label}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "h-10 justify-start gap-2 rounded-xl px-3 text-[13px] transition-colors",
                  isActive &&
                    "border border-border/60 bg-secondary font-medium",
                )}
              >
                <Link href={item.href}>
                  <Icon className="size-4" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </nav>

        <p className="rounded-xl border bg-background/60 px-3 py-2 text-xs text-muted-foreground">
          Quick access to all finance sections
        </p>
      </div>
    </aside>
  );
}
