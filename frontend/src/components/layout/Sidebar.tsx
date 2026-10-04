"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  FileText,
  Receipt,
  DollarSign,
  XCircle,
  ReceiptText,
  CheckSquare,
  Folder,
  BarChart3,
  Bell,
  Shield,
  ScrollText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/hooks/useAuth";
import { useSidebar } from "./SidebarContext";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItemConfig {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface NavSectionConfig {
  title: string;
  items: NavItemConfig[];
  adminOnly?: boolean;
}

const NAV_SECTIONS: NavSectionConfig[] = [
  {
    title: "Main",
    items: [{ label: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    title: "Clinical",
    items: [
      { label: "Patients", href: "/patients", icon: Users },
      { label: "Providers", href: "/providers", icon: Stethoscope },
      { label: "Appointments", href: "/appointments", icon: Calendar },
      { label: "Encounters", href: "/encounters", icon: FileText },
    ],
  },
  {
    title: "Billing",
    items: [
      { label: "Claims", href: "/claims", icon: Receipt, badge: "12" },
      { label: "Payments", href: "/payments", icon: DollarSign },
      { label: "Denials", href: "/denials", icon: XCircle, badge: "3" },
      { label: "Invoices", href: "/invoices", icon: ReceiptText },
    ],
  },
  {
    title: "Workflow",
    items: [
      { label: "Tasks", href: "/tasks", icon: CheckSquare, badge: "5" },
      { label: "Documents", href: "/documents", icon: Folder },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Reports", href: "/reports", icon: BarChart3 },
      { label: "Notifications", href: "/notifications", icon: Bell, badge: "3" },
    ],
  },
  {
    title: "Admin",
    adminOnly: true,
    items: [
      { label: "Users & Roles", href: "/users", icon: Shield },
      { label: "Audit Logs", href: "/audit-logs", icon: ScrollText },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const logout = useLogout();
  const { isCollapsed, toggleCollapsed, isMobileOpen, closeMobile } = useSidebar();

  const userRole = user?.role?.toUpperCase() || "";
  const isAdmin =
    userRole === "ORG_ADMIN" ||
    userRole === "PLATFORM_ADMIN" ||
    userRole === "SUPER_ADMIN";

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "MD";

  const isRouteActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const renderContent = (isMobileMode: boolean = false) => {
    const collapsed = isMobileMode ? false : isCollapsed;

    return (
      <div className="flex h-full flex-col justify-between overflow-hidden">
        {/* Top Header & Logo */}
        <div className="flex flex-col">
          <div
            className={cn(
              "flex h-16 items-center justify-between border-b border-slate-200/80 px-4",
              collapsed ? "justify-center px-2" : "px-4"
            )}
          >
            <Link
              href="/"
              onClick={() => isMobileMode && closeMobile()}
              className="flex items-center gap-2.5 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg gradient-primary text-white shadow-sm">
                <Activity className="h-5 w-5" />
              </div>
              {!collapsed && (
                <div className="flex flex-col overflow-hidden text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 tracking-tight text-base leading-tight">
                      Medi<span className="text-indigo-600">Flow</span>
                    </span>
                    <span className="text-[10px] font-semibold bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded border border-teal-200/60 uppercase">
                      SaaS
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium truncate max-w-[140px]">
                    {user?.organization?.name || "Medical Billing"}
                  </span>
                </div>
              )}
            </Link>

            {/* Mobile close button */}
            {isMobileMode && (
              <Button
                variant="ghost"
                size="icon"
                onClick={closeMobile}
                className="h-8 w-8 text-slate-500 hover:text-slate-800 lg:hidden"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Navigation Links Scrollable Area */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
            {NAV_SECTIONS.map((section) => {
              // Hide admin section if user is not authorized
              if (section.adminOnly && !isAdmin) {
                return null;
              }

              return (
                <div key={section.title} className="space-y-1">
                  {!collapsed ? (
                    <h3 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {section.title}
                    </h3>
                  ) : (
                    <div className="my-2 border-t border-slate-200/60" />
                  )}

                  <div className="space-y-0.5">
                    {section.items.map((item) => (
                      <SidebarMenuItem
                        key={item.href}
                        label={item.label}
                        href={item.href}
                        icon={item.icon}
                        badge={item.badge}
                        isCollapsed={collapsed}
                        isActive={isRouteActive(item.href)}
                        onClick={() => isMobileMode && closeMobile()}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-200/80 p-3 space-y-3 bg-slate-50/70">
          {!collapsed && (
            <div className="hidden lg:flex items-center gap-2 px-2 py-1.5 rounded-lg bg-teal-50/70 border border-teal-200/60 text-teal-800 text-[11px] font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-600 shrink-0" />
              <span className="truncate">HIPAA Compliant & Audited</span>
            </div>
          )}

          {/* User profile row */}
          <div
            className={cn(
              "flex items-center gap-2.5 rounded-lg p-1.5 transition-colors",
              collapsed ? "justify-center" : "justify-between"
            )}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Avatar className="h-8 w-8 border border-indigo-200 bg-indigo-50 text-indigo-700 shrink-0">
                <AvatarFallback className="font-semibold text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>

              {!collapsed && (
                <div className="flex flex-col overflow-hidden text-left">
                  <span className="text-xs font-semibold text-slate-800 truncate leading-tight">
                    {user?.name || "Billing Specialist"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium truncate capitalize">
                    {user?.role?.replace("_", " ").toLowerCase() || "Practitioner"}
                  </span>
                </div>
              )}
            </div>

            {/* Quick logout */}
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                title="Log out"
                aria-label="Log out"
                className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Desktop collapse toggle */}
          {!isMobileMode && (
            <div className="hidden lg:flex justify-end pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCollapsed}
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                className={cn(
                  "w-full h-8 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors flex items-center justify-center gap-2",
                  isCollapsed && "p-0"
                )}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <>
                    <ChevronLeft className="h-4 w-4" />
                    <span>Collapse menu</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar (lg+) */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-slate-200/80 bg-white transition-all duration-300 ease-in-out shrink-0 sticky top-0 h-screen z-20",
          isCollapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        {renderContent(false)}
      </aside>

      {/* Mobile Drawer (Overlay for < lg) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
      >
        {renderContent(true)}
      </div>
    </>
  );
};

export default Sidebar;
