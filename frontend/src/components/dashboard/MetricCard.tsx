"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type MetricColorVariant = "indigo" | "teal" | "emerald" | "amber";

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  colorVariant?: MetricColorVariant;
  className?: string;
}

const colorStyles: Record<
  MetricColorVariant,
  {
    bgIcon: string;
    iconColor: string;
    borderHover: string;
  }
> = {
  indigo: {
    bgIcon: "bg-indigo-50 text-indigo-600",
    iconColor: "text-indigo-600",
    borderHover: "hover:border-indigo-300",
  },
  teal: {
    bgIcon: "bg-teal-50 text-teal-600",
    iconColor: "text-teal-600",
    borderHover: "hover:border-teal-300",
  },
  emerald: {
    bgIcon: "bg-emerald-50 text-emerald-600",
    iconColor: "text-emerald-600",
    borderHover: "hover:border-emerald-300",
  },
  amber: {
    bgIcon: "bg-amber-50 text-amber-600",
    iconColor: "text-amber-600",
    borderHover: "hover:border-amber-300",
  },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  colorVariant = "indigo",
  className,
}) => {
  const styles = colorStyles[colorVariant];

  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card",
        styles.borderHover,
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <div className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 pt-0.5">
            {value}
          </div>
        </div>

        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
            styles.bgIcon
          )}
        >
          <Icon className={cn("h-5 w-5", styles.iconColor)} />
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-1.5 text-xs font-medium">
          {trend.isPositive !== false ? (
            <span className="inline-flex items-center gap-0.5 font-semibold text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" />
              {trend.value}
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 font-semibold text-rose-600">
              <TrendingDown className="h-3.5 w-3.5" />
              {trend.value}
            </span>
          )}
          {trend.label && (
            <span className="text-slate-500 font-normal">{trend.label}</span>
          )}
        </div>
      )}
    </Card>
  );
};

export default MetricCard;
