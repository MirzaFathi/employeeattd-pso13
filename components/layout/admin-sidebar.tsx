"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Calendar,
  DollarSign,
  Clock,
  Building2,
  BarChart2,
  ScrollText,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSidebar } from "@/lib/SidebarContext";
import type { UserRole } from "@/types";

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  /** Which roles can see this item. If omitted, all admin-type roles can see it. */
  allowedRoles?: UserRole[];
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, allowedRoles: ["admin"] },
  { name: "Employees", href: "/admin/employees", icon: Users, allowedRoles: ["admin"] },
  { name: "Attendance", href: "/admin/attendance", icon: ClipboardCheck, allowedRoles: ["admin"] },
  { name: "Leaves", href: "/admin/leaves", icon: Calendar, allowedRoles: ["admin"] },
  { name: "Holidays", href: "/admin/holidays", icon: Calendar, allowedRoles: ["admin", "finance"] },
  { name: "Payroll", href: "/admin/payroll", icon: DollarSign, allowedRoles: ["admin", "finance"] },
  { name: "Shifts", href: "/admin/shifts", icon: Clock, allowedRoles: ["admin"] },
  { name: "Departments", href: "/admin/departments", icon: Building2, allowedRoles: ["admin"] },
  { name: "Reports", href: "/admin/reports", icon: BarChart2, allowedRoles: ["admin"] },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText, allowedRoles: ["admin"] },
  { name: "Settings", href: "/admin/settings", icon: Settings, allowedRoles: ["admin"] },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { isAdminCollapsed: isCollapsed, setIsAdminCollapsed: setIsCollapsed } = useSidebar();
  const [userRole, setUserRole] = useState<UserRole>("admin");

  // Fetch user's effective role
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.role) {
            setUserRole(data.data.role as UserRole);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user role for sidebar:", error);
      }
    };
    fetchRole();
  }, []);

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(userRole)
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[var(--neu-surface)] rounded-lg shadow-[var(--neu-shadow)]"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-[var(--neu-bg)]/90 backdrop-blur-md border-r border-[var(--neu-border)] z-40 transition-all duration-300",
          isCollapsed ? "w-20" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-[var(--neu-border)] p-4">
          <Link href={userRole === "finance" ? "/admin/holidays" : "/admin"} className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="AttendEase Logo" 
              className={cn(
                "transition-all duration-300",
                isCollapsed ? "w-10 h-10 object-contain" : "h-12 w-auto object-contain"
              )} 
            />
          </Link>
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "hidden lg:flex absolute right-2 top-4 w-8 h-8 bg-[var(--neu-surface)] rounded-lg items-center justify-center text-[var(--neu-text-secondary)] shadow-sm z-50 hover:bg-[var(--neu-accent)] hover:text-white transition-all",
            "border border-white/5",
            isCollapsed && "right-[-40px] bg-[var(--neu-accent)] text-white" // When collapsed, stick it out slightly so it's clickable
          )}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* Nav items */}
        <nav className="p-4 space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                  isActive
                    ? "bg-[var(--neu-accent)] text-white shadow-[var(--neu-shadow)]"
                    : "text-[var(--neu-text-secondary)] hover:bg-[var(--neu-surface)] hover:text-[var(--neu-text)]"
                )}
              >
                <Icon size={20} />
                {!isCollapsed && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
