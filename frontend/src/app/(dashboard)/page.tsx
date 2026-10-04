"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  Stethoscope,
  Calendar,
  FileText,
  Clock,
  ArrowUpRight,
  UserPlus,
  Building,
  CheckCircle2,
  Layers,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCurrentUser } from "@/hooks/useAuth";
import { usePatientStats } from "@/hooks/usePatients";
import { useProviderStats } from "@/hooks/useProviders";
import { useUpcomingAppointments, useAppointmentStats } from "@/hooks/useAppointments";
import { useEncounters, useEncounterStats } from "@/hooks/useEncounters";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { user: localUser } = useAuthStore();
  const { data: userProfile } = useCurrentUser();

  const user = userProfile || localUser;
  const firstName = user?.name ? user.name.split(" ")[0] : "Practitioner";

  // Real API hooks for dashboard widgets
  const { data: patientStats } = usePatientStats();
  const { data: providerStats } = useProviderStats();
  const { data: appointmentStats } = useAppointmentStats();
  const { data: encounterStats } = useEncounterStats();
  const { data: upcomingAppointments = [], isLoading: isUpcomingLoading } =
    useUpcomingAppointments(5);
  const { data: recentEncountersData, isLoading: isEncountersLoading } =
    useEncounters({ limit: 5 });

  const recentEncounters = recentEncountersData?.data || [];

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
            Clinical Operations & Billing Hub
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, <span className="font-semibold text-slate-800">{firstName}</span>.
            Here is your live multi-tenant overview across patients, providers, and clinical visits.
          </p>
        </div>

        {/* Global Action Shortcut Buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/appointments"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "border-slate-200 hover:bg-slate-100 text-slate-700 shadow-2xs inline-flex items-center gap-1.5"
            )}
          >
            <Calendar className="h-4 w-4 text-indigo-600" />
            <span>Schedule Visit</span>
          </Link>
          <Link
            href="/patients/new"
            className={cn(
              buttonVariants({ size: "sm" }),
              "gradient-primary text-white hover:opacity-95 shadow-xs border-0 inline-flex items-center gap-1.5"
            )}
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Patient</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards Grid with live API stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          title="Total Patients"
          value={patientStats ? String(patientStats.total) : "—"}
          icon={Users}
          colorVariant="indigo"
          trend={{
            value: patientStats?.newThisMonth ? `+${patientStats.newThisMonth}` : "0",
            isPositive: true,
            label: "new this month",
          }}
        />
        <MetricCard
          title="Active Clinicians"
          value={providerStats ? String(providerStats.active) : "—"}
          icon={Stethoscope}
          colorVariant="teal"
          trend={{
            value: providerStats ? `${providerStats.total} total` : "—",
            isPositive: true,
            label: "in registry",
          }}
        />
        <MetricCard
          title="Scheduled Visits"
          value={appointmentStats ? String(appointmentStats.pending) : "—"}
          icon={Calendar}
          colorVariant="emerald"
          trend={{
            value: appointmentStats ? `${appointmentStats.today} today` : "—",
            isPositive: true,
            label: "appointments",
          }}
        />
        <MetricCard
          title="Encounters This Month"
          value={encounterStats ? String(encounterStats.thisMonth) : "—"}
          icon={FileText}
          colorVariant="amber"
          trend={{
            value: encounterStats ? `${encounterStats.total} total` : "—",
            isPositive: true,
            label: "documented",
          }}
        />
      </div>

      {/* Main Grid: Upcoming Appointments (left 2 cols) & Clinical Encounters / Actions (right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Upcoming Appointments & Encounters (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Appointments Widget */}
          <Card className="border-slate-200/90 shadow-subtle rounded-xl overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-600" />
                  Upcoming Patient Appointments
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Next scheduled consultations and clinical visits
                </CardDescription>
              </div>
              <Link
                href="/appointments"
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
              {isUpcomingLoading ? (
                <div className="p-4 space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No upcoming appointments scheduled.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {upcomingAppointments.map((apt) => {
                    const aptDate = new Date(apt.date);
                    return (
                      <Link
                        key={apt.id}
                        href={`/appointments/${apt.id}`}
                        className="flex items-center justify-between p-3.5 sm:px-5 hover:bg-slate-50/70 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {apt.patient?.firstName} {apt.patient?.lastName}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Dr. {apt.provider?.firstName} {apt.provider?.lastName} •{" "}
                              {apt.type || "Check-up"}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-semibold text-slate-800 font-mono">
                            {aptDate.toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="block text-[11px] text-slate-400">
                            {aptDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Encounters Widget */}
          <Card className="border-slate-200/90 shadow-subtle rounded-xl overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-teal-600" />
                  Recent Clinical Encounters
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Latest documented visits ready for charge entry and claim submission
                </CardDescription>
              </div>
              <Link
                href="/encounters"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "text-xs font-semibold text-teal-700 hover:text-teal-800 hover:bg-teal-50 inline-flex items-center gap-1"
                )}
              >
                <span>All Encounters</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              {isEncountersLoading ? (
                <div className="p-4 space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : recentEncounters.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No encounters documented yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentEncounters.map((enc) => (
                    <Link
                      key={enc.id}
                      href={`/encounters/${enc.id}`}
                      className="flex items-center justify-between p-3.5 sm:px-5 hover:bg-slate-50/70 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                            {enc.patient?.firstName} {enc.patient?.lastName}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {enc.visitType || "Office Visit"} • Dr. {enc.provider?.lastName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-600">
                          DOS: {new Date(enc.dateOfService).toLocaleDateString()}
                        </span>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Quick Actions & Clinical Provider Breakdown (1 col on lg) */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <Card className="border-slate-200/90 shadow-subtle rounded-xl bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm sm:text-base font-bold text-slate-900">
                Quick Shortcuts
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Direct actions for clinical workflows
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              <Link
                href="/patients/new"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full justify-start text-xs font-medium text-slate-700 hover:text-indigo-700 hover:bg-indigo-50/60 hover:border-indigo-200 transition-colors h-10 inline-flex items-center"
                )}
              >
                <UserPlus className="h-4 w-4 mr-2.5 text-indigo-600" />
                <span>Register New Patient</span>
              </Link>
              <Link
                href="/appointments"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full justify-start text-xs font-medium text-slate-700 hover:text-teal-700 hover:bg-teal-50/60 hover:border-teal-200 transition-colors h-10 inline-flex items-center"
                )}
              >
                <Calendar className="h-4 w-4 mr-2.5 text-teal-600" />
                <span>Schedule Appointment</span>
              </Link>
              <Link
                href="/encounters"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full justify-start text-xs font-medium text-slate-700 hover:text-teal-700 hover:bg-teal-50/60 hover:border-teal-200 transition-colors h-10 inline-flex items-center"
                )}
              >
                <FileText className="h-4 w-4 mr-2.5 text-teal-600" />
                <span>Document Encounter</span>
              </Link>
              <Link
                href="/providers"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full justify-start text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors h-10 inline-flex items-center"
                )}
              >
                <Stethoscope className="h-4 w-4 mr-2.5 text-slate-600" />
                <span>Manage Healthcare Providers</span>
              </Link>
            </CardContent>
          </Card>

          {/* Provider Specialties Breakdown */}
          <Card className="border-slate-200/90 shadow-subtle rounded-xl bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-600" />
                Practitioner Registry
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Active clinician specialty coverage
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {providerStats?.bySpecialty &&
              Object.keys(providerStats.bySpecialty).length > 0 ? (
                <div className="space-y-2.5">
                  {Object.entries(providerStats.bySpecialty).map(([spec, count]) => (
                    <div key={spec} className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-medium">{spec}</span>
                      <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
                        {count} {count === 1 ? "doctor" : "doctors"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  No specialty data recorded yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
