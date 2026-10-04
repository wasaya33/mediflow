"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const ROUTE_LABELS: Record<string, string> = {
  patients: "Patients",
  providers: "Providers",
  appointments: "Appointments",
  encounters: "Encounters",
  claims: "Claims",
  payments: "Payments",
  denials: "Denials",
  invoices: "Invoices",
  tasks: "Tasks",
  documents: "Documents",
  reports: "Reports",
  notifications: "Notifications",
  users: "Users & Roles",
  "audit-logs": "Audit Logs",
  settings: "Settings",
  profile: "User Profile",
  billing: "Billing & Invoices",
  analytics: "Analytics & Reports",
  payers: "Payers & Clearinghouses",
};

/**
 * Formats a single slug segment into human-readable text if not found in dictionary.
 */
function formatSegment(segment: string): string {
  if (ROUTE_LABELS[segment]) {
    return ROUTE_LABELS[segment];
  }
  // Check if it's a UUID or numeric ID
  if (/^[0-9a-fA-F-]{8,}$/.test(segment) || /^\d+$/.test(segment)) {
    return `#${segment.slice(0, 8)}`;
  }
  // Convert kebab-case or snake_case to Title Case
  return segment
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const Breadcrumbs: React.FC<{ className?: string }> = ({ className }) => {
  const pathname = usePathname() || "/";
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center text-xs md:text-sm", className)}>
      <ol className="flex items-center space-x-1.5 md:space-x-2 text-slate-500 font-medium">
        {/* Root / Home link */}
        <li className="flex items-center">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-1.5 transition-colors hover:text-indigo-600 rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
              segments.length === 0 ? "text-slate-900 font-semibold cursor-default" : "text-slate-500"
            )}
            aria-current={segments.length === 0 ? "page" : undefined}
          >
            <Home className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </li>

        {/* Dynamic route segments */}
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;
          const label = formatSegment(segment);

          return (
            <li key={href} className="flex items-center space-x-1.5 md:space-x-2">
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              {isLast ? (
                <span
                  className="font-semibold text-slate-900 truncate max-w-[150px] sm:max-w-xs"
                  aria-current="page"
                >
                  {label}
                </span>
              ) : (
                <Link
                  href={href}
                  className="text-slate-500 hover:text-indigo-600 transition-colors truncate max-w-[120px] rounded-md p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
