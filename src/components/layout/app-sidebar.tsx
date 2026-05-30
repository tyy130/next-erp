"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Building2,
  CalendarDays,
  LayoutDashboard,
  Briefcase,
  Contact,
  TrendingUp,
  Receipt,
  CreditCard,
  BookOpen,
  BarChart3,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const nav = [
  {
    label: "HRM",
    items: [
      { title: "Employees", href: "/hrm/employees", icon: Users },
      { title: "Departments", href: "/hrm/departments", icon: Building2 },
      { title: "Leave Management", href: "/hrm/leaves", icon: CalendarDays },
    ],
  },
  {
    label: "CRM",
    items: [
      { title: "Contacts", href: "/crm/contacts", icon: Contact },
      { title: "Companies", href: "/crm/companies", icon: Briefcase },
      { title: "Deals", href: "/crm/deals", icon: TrendingUp },
    ],
  },
  {
    label: "Accounting",
    items: [
      { title: "Invoices", href: "/accounting/invoices", icon: Receipt },
      { title: "Expenses", href: "/accounting/expenses", icon: CreditCard },
      {
        title: "Chart of Accounts",
        href: "/accounting/accounts",
        icon: BookOpen,
      },
      { title: "Reports", href: "/accounting/reports", icon: BarChart3 },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="NextERP"
            width={140}
            height={36}
            priority
          />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link href="/dashboard" />}
                isActive={pathname === "/dashboard"}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {nav.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={pathname.startsWith(item.href)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}

        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link href="/settings" />}
                isActive={pathname === "/settings"}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
