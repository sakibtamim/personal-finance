import { DashboardFinanceProvider } from "@/components/providers/dashboard-finance-provider";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardFinanceProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardFinanceProvider>
  );
}
