"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: boolean | string;
  label?: string;
  activeLabel?: string;
  inactiveLabel?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
  className,
}) => {
  // If boolean
  if (typeof status === "boolean") {
    const text = label || (status ? activeLabel : inactiveLabel);
    return status ? (
      <Badge
        className={cn(
          "bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100 font-medium px-2 py-0.5 text-xs inline-flex items-center gap-1.5",
          className
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
        <span>{text}</span>
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className={cn(
          "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/80 font-medium px-2 py-0.5 text-xs inline-flex items-center gap-1.5",
          className
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
        <span>{text}</span>
      </Badge>
    );
  }

  // String status variants
  const normalized = status.toUpperCase();
  const displayLabel = label || status;

  switch (normalized) {
    case "ACTIVE":
    case "COMPLETED":
    case "PAID":
      return (
        <Badge
          className={cn(
            "bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100 font-medium px-2 py-0.5 text-xs inline-flex items-center gap-1.5",
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span>{displayLabel}</span>
        </Badge>
      );
    case "SCHEDULED":
      return (
        <Badge
          className={cn(
            "bg-indigo-50 text-indigo-700 border-indigo-200/80 hover:bg-indigo-100 font-medium px-2 py-0.5 text-xs inline-flex items-center gap-1.5",
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
          <span>{displayLabel}</span>
        </Badge>
      );
    case "EXPIRED":
    case "DENIED":
    case "INACTIVE":
    case "CANCELLED":
      return (
        <Badge
          className={cn(
            "bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-rose-100 font-medium px-2 py-0.5 text-xs inline-flex items-center gap-1.5",
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
          <span>{displayLabel}</span>
        </Badge>
      );
    case "PENDING":
    case "ADJUDICATING":
    case "NO_SHOW":
      return (
        <Badge
          className={cn(
            "bg-amber-50 text-amber-700 border-amber-200/80 hover:bg-amber-100 font-medium px-2 py-0.5 text-xs inline-flex items-center gap-1.5",
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
          <span>{displayLabel}</span>
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-slate-50 text-slate-700 border-slate-200 font-medium px-2 py-0.5 text-xs",
            className
          )}
        >
          {displayLabel}
        </Badge>
      );
  }
};

export default StatusBadge;
