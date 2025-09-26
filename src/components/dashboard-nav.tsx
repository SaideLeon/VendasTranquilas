"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  AreaChart,
} from "lucide-react";

const links = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/transactions",
    label: "Transações",
    icon: ArrowLeftRight,
  },
  {
    href: "/dashboard/budgets",
    label: "Orçamentos",
    icon: PiggyBank,
  },
  {
    href: "/dashboard/reports",
    label: "Relatórios",
    icon: AreaChart,
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
          <Link href={link.href} passHref legacyBehavior>
            <SidebarMenuButton
              asChild
              isActive={pathname === link.href}
              tooltip={link.label}
            >
              <a>
                <link.icon />
                <span>{link.label}</span>
              </a>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
