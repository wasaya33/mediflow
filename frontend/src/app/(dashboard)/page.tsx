"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  Receipt,
  DollarSign,
  CheckSquare,
  ArrowUpRight,
  UserPlus,
  FilePlus2,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCurrentUser } from "@/hooks/useAuth";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MockClaim {
  id: string;
  patient: string;
  status: "PAID" | "ADJUDICATING" | "SUBMITTED" | "DENIED";
  amount: string;
  date: string;
}

interface MockActivity {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
}

const mockClaims: MockClaim[] = [
  {
    id: "CLM-9082",
    patient: "Eleanor Vance",
    status: "PAID",
    amount: "$1,450.00",
    date: "Today, 10:14 AM",
  },
  {
    id: "CLM-9081",
    patient: "Marcus Sterling",
    status: "ADJUDICATING",
    amount: "$820.00",
    date: "Today, 09:28 AM",
  },
  {
    id: "CLM-9080",
    patient: "Clara Oswald",
    status: "SUBMITTED",
    amount: "$2,100.00",
    date: "Yesterday",
  },
  {
    id: "CLM-9079",
    patient: "David Tennant",
    status: "PAID",
    amount: "$540.00",
    date: "Oct 2, 2026",
  },
  {
    id: "CLM-9078",
    patient: "Rose Tyler",
    status: "DENIED",
    amount: "$320.00",
    date: "Oct 1, 2026",
  },
];

const mockActivities: MockActivity[] = [
  {
    id: "act-1",
    title: "Claim #CLM-9082 Adjudicated",
    description: "Paid in full by Blue Cross Blue Shield ($1,450.00)",
    time: "12m ago",
    icon: CheckCircle2,
    iconBg: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "act-2",
    title: "Copay Posted",
    description: "Patient payment received for Eleanor Vance ($45.00)",
    time: "48m ago",
    icon: CreditCard,
    iconBg: "bg-indigo-100 text-indigo-700",
  },
  {
    id: "act-3",
    title: "Batch 837P Submitted",
    description: "14 outpatient encounters delivered to Availity",
    time: "2h ago",
    icon: FileCheck,
    iconBg: "bg-teal-100 text-teal-700",
  },
  {
    id: "act-4",
    title: "Payer Denial Logged",
    description: "Claim #CLM-9078 flagged: CPT modifier invalid",
    time: "3h ago",
    icon: AlertCircle,
    iconBg: "bg-rose-100 text-rose-700",
  },
  {
    id: "act-5",
    title: "Pre-Authorization Verified",
    description: "MRI Lumbar Spine cleared for Marcus Sterling",
    time: "5h ago",
    icon: Clock,
    iconBg: "bg-amber-100 text-amber-700",
  },
];

export default function DashboardPage() {
  const { user: localUser } = useAuthStore();
  const { data: userProfile } = useCurrentUser();

  const user = userProfile || localUser;
  const firstName = user?.name ? user.name.split(" ")[0] : "Practitioner";

  const renderStatusBadge = (status: MockClaim["status"]) => {
    switch (status) {
      case "PAID":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
            Paid
          </Badge>
        );
      case "ADJUDICATING":
        return (
          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100">
            In Review
          </Badge>
        );
      case "SUBMITTED":
        return (
          <Badge className="bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100">
            Submitted
          </Badge>
        );
      case "DENIED":
        return (
          <Badge className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100">
            Denied
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Page Header with Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
            <Building className="h-3.5 w-3.5" />
            <span>{user?.organization?.name || "Active Workspace"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, <span className="font-medium text-slate-800">{firstName}</span>. Here is your medical billing performance overview for today.
          </p>
        </div>

        {/* Global Action Shortcut Buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/reports"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "border-slate-200 hover:bg-slate-100 text-slate-700 shadow-2xs inline-flex items-center gap-1.5"
            )}
          >
            <ArrowUpRight className="h-4 w-4 text-slate-500" />
            <span>View Reports</span>
          </Link>
          <Link
            href="/claims"
            className={cn(
              buttonVariants({ size: "sm" }),
              "gradient-primary text-white hover:opacity-95 shadow-xs border-0 inline-flex items-center gap-1.5"
            )}
          >
            <FilePlus2 className="h-4 w-4" />
            <span>Create Claim</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards Grid: 2 cols on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          title="Total Patients"
          value="1,428"
          icon={Users}
          colorVariant="indigo"
          trend={{ value: "+12%", isPositive: true, label: "from last month" }}
        />
        <MetricCard
          title="Active Claims"
          value="164"
          icon={Receipt}
          colorVariant="teal"
          trend={{ value: "+8%", isPositive: true, label: "vs last week" }}
        />
        <MetricCard
          title="Total Revenue"
          value="$248,650"
          icon={DollarSign}
          colorVariant="emerald"
          trend={{ value: "+18.4%", isPositive: true, label: "from last month" }}
        />
        <MetricCard
          title="Pending Tasks"
          value="19"
          icon={CheckSquare}
          colorVariant="amber"
          trend={{ value: "4 urgent", isPositive: false, label: "due today" }}
        />
      </div>

      {/* Two sections: Recent Claims Table (left) and Quick Actions / Activity (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Claims Table (2 cols on lg) */}
        <Card className="lg:col-span-2 border-slate-200/90 shadow-subtle rounded-xl overflow-hidden bg-white">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                Recent Claims
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Latest claims processed across insurance payers and clearinghouses
              </CardDescription>
            </div>
            <Link
              href="/claims"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 inline-flex items-center gap-1"
              )}
            >
              <span>View All</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/75">
                  <TableRow className="border-slate-100">
                    <TableHead className="text-xs font-semibold text-slate-600 pl-6">
                      Claim #
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600">
                      Patient
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600">
                      Amount
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600 text-right pr-6">
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockClaims.map((claim) => (
                    <TableRow
                      key={claim.id}
                      className="border-slate-100 hover:bg-slate-50/60 transition-colors"
                    >
                      <TableCell className="font-mono text-xs font-semibold text-indigo-600 pl-6">
                        {claim.id}
                      </TableCell>
                      <TableCell className="font-medium text-slate-800 text-sm">
                        {claim.patient}
                      </TableCell>
                      <TableCell>{renderStatusBadge(claim.status)}</TableCell>
                      <TableCell className="font-semibold text-slate-900 text-sm">
                        {claim.amount}
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs text-right pr-6">
                        {claim.date}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Right: Quick Actions & Recent Activity (1 col on lg) */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <Card className="border-slate-200/90 shadow-subtle rounded-xl bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm sm:text-base font-bold text-slate-900">
                Quick Actions
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Instant shortcuts for high-frequency clinical billing tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              <Link
                href="/patients"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full justify-start text-xs font-medium text-slate-700 hover:text-indigo-700 hover:bg-indigo-50/60 hover:border-indigo-200 transition-colors h-10 inline-flex items-center"
                )}
              >
                <UserPlus className="h-4 w-4 mr-2.5 text-indigo-600" />
                <span>New Patient</span>
              </Link>
              <Link
                href="/claims"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full justify-start text-xs font-medium text-slate-700 hover:text-teal-700 hover:bg-teal-50/60 hover:border-teal-200 transition-colors h-10 inline-flex items-center"
                )}
              >
                <FilePlus2 className="h-4 w-4 mr-2.5 text-teal-600" />
                <span>New Claim</span>
              </Link>
              <Link
                href="/payments"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full justify-start text-xs font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/60 hover:border-emerald-200 transition-colors h-10 inline-flex items-center"
                )}
              >
                <CreditCard className="h-4 w-4 mr-2.5 text-emerald-600" />
                <span>Post Payment</span>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card className="border-slate-200/90 shadow-subtle rounded-xl bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm sm:text-base font-bold text-slate-900">
                Recent Activity
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Live clearinghouse and tenant audit feed
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {mockActivities.map((act) => {
                  const Icon = act.icon;
                  return (
                    <div key={act.id} className="flex items-start gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${act.iconBg}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5 overflow-hidden flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {act.title}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {act.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug truncate">
                          {act.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
