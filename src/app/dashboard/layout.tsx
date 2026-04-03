import { DashboardFinanceProvider } from "@/components/providers/dashboard-finance-provider";
import { DashboardRouteGuard } from "@/components/dashboard/dashboard-route-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardRouteGuard>
      <DashboardFinanceProvider>
        <DashboardShell>{children}</DashboardShell>
      </DashboardFinanceProvider>
    </DashboardRouteGuard>
  );
}
