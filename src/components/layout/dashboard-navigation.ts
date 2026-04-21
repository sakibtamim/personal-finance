import type { LucideIcon } from "lucide-react";
import {
  CalendarRange,
  CircleDollarSign,
  PiggyBank,
  Settings,
  User,
} from "lucide-react";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  {
    label: "Current-Month",
    href: "/dashboard/current-month",
    icon: CircleDollarSign,
  },
  {
    label: "Monthly-Flow",
    href: "/dashboard/monthly-flow",
    icon: CalendarRange,
  },
  {
    label: "Savings",
    href: "/dashboard/savings",
    icon: PiggyBank,
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];
