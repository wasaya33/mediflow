"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  category?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description,
  icon: Icon,
  badge = "In Development",
  category = "MediFlow Module",
}) => {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
            <span>{category}</span>
            <span className="text-slate-300">•</span>
            <Badge
              variant="outline"
              className="text-[10px] bg-indigo-50/70 text-indigo-700 border-indigo-200"
            >
              {badge}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">{description}</p>
        </div>

        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "border-slate-200 hover:bg-slate-100 text-slate-700 shadow-2xs self-start sm:self-auto inline-flex items-center gap-1.5"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Coming Soon Showcase Card */}
      <Card className="border-slate-200/90 shadow-subtle rounded-2xl bg-white overflow-hidden p-8 sm:p-12 text-center">
        <CardContent className="p-0 flex flex-col items-center justify-center max-w-md mx-auto space-y-5">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-50 to-teal-50 border border-indigo-100 text-indigo-600 shadow-xs">
            <Icon className="h-8 w-8 text-indigo-600" />
            <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-white shadow-xs">
              <Sparkles className="h-3 w-3" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {title} Module Coming Soon
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              This module is currently being finalized according to ANSI X12 837/835 standards and HIPAA compliance protocols. Live integration will be active in the next release.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              Multi-Tenant Isolation
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              RBAC Guarded
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              Encrypted at Rest
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlaceholderPage;
