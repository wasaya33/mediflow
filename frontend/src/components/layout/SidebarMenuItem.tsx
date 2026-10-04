"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SidebarMenuItemProps {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  isCollapsed?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

export const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({
  label,
  href,
  icon: Icon,
  badge,
  isCollapsed = false,
  isActive = false,
  onClick,
}) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
        isActive
          ? "bg-indigo-50 text-indigo-700 shadow-xs font-semibold"
          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900",
        isCollapsed && "justify-center px-2 py-2.5"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors duration-200",
          isActive
            ? "text-indigo-600"
            : "text-slate-400 group-hover:text-slate-700"
        )}
      />

      {!isCollapsed && (
        <span className="flex-1 truncate tracking-tight">{label}</span>
      )}

      {!isCollapsed && badge !== undefined && (
        <span
          className={cn(
            "ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors",
            isActive
              ? "bg-indigo-200/70 text-indigo-800"
              : "bg-teal-50 text-teal-700 border border-teal-200/50"
          )}
        >
          {badge}
        </span>
      )}

      {/* Floating tooltip when sidebar is collapsed */}
      {isCollapsed && (
        <div className="pointer-events-none absolute left-full ml-3 z-50 hidden rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white shadow-lg whitespace-nowrap group-hover:block animate-in fade-in zoom-in-95 duration-150">
          {label}
          {badge !== undefined && (
            <span className="ml-1.5 rounded-full bg-teal-500 px-1.5 py-0.2 text-[9px] text-white">
              {badge}
            </span>
          )}
        </div>
      )}
    </Link>
  );
};

export default SidebarMenuItem;
