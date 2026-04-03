import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-background via-background to-muted/30">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-12 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-chart-1/20 blur-3xl" />
      </div>

      <DashboardSidebar />

      <div className="md:pl-64">
        <DashboardTopbar />

        <main className="px-4 py-6 md:px-10 md:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
