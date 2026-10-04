"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Stethoscope,
  Edit,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Shield,
  Activity,
  Award,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useProvider, useUpdateProvider } from "@/hooks/useProviders";
import { useAppointments } from "@/hooks/useAppointments";
import { useEncounters } from "@/hooks/useEncounters";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ProviderForm } from "@/components/forms/ProviderForm";
import { CreateProviderRequest } from "@/types";
import { cn } from "@/lib/utils";

export default function ProviderDetailsPage() {
  const params = useParams();
  const providerId = String(params.id);

  const [activeTab, setActiveTab] = useState("overview");
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: provider, isLoading, isError } = useProvider(providerId);
  const updateProviderMutation = useUpdateProvider();

  // Queries for linked appointments and encounters
  const { data: appointmentsData } = useAppointments({
    providerId,
    limit: 10,
  });

  const { data: encountersData } = useEncounters({
    providerId,
    limit: 10,
  });

  const appointments = appointmentsData?.data || [];
  const encounters = encountersData?.data || [];

  const handleUpdate = async (payload: CreateProviderRequest) => {
    try {
      await updateProviderMutation.mutateAsync({
        id: providerId,
        data: payload,
      });
      toast.success("Provider details updated successfully.");
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to update provider.";
      toast.error(errorMsg);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="h-32 w-full bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-44 bg-slate-100 animate-pulse rounded-xl" />
          <div className="h-44 bg-slate-100 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !provider) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
          <Stethoscope className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Provider Record Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested provider does not exist or you do not have permission to view it.
        </p>
        <Link
          href="/providers"
          className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Providers List
        </Link>
      </div>
    );
  }

  const fullName = `Dr. ${provider.firstName} ${provider.lastName}`;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/providers"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Back to Providers
        </Link>
      </div>

      {/* Hero Header Card */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Stethoscope className="h-7 w-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {fullName}
                </h1>
                <StatusBadge
                  status={provider.isActive ? "active" : "inactive"}
                  label={provider.isActive ? "Active" : "Inactive"}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-600">
                <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                  NPI: {provider.npi || "Unassigned"}
                </span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-medium border border-indigo-200/60">
                  {provider.specialty || "General Practice"}
                </span>
                {provider.taxId && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-mono">Tax ID: {provider.taxId}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={() => setIsEditOpen(true)}
            variant="outline"
            className="self-start sm:self-auto gap-1.5 h-9"
          >
            <Edit className="h-4 w-4" />
            Edit Provider
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100/90 border border-slate-200/80 p-1 rounded-xl">
          <TabsTrigger value="overview" className="text-xs gap-1.5">
            <Award className="h-3.5 w-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="appointments" className="text-xs gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Appointments ({appointments.length})
          </TabsTrigger>
          <TabsTrigger value="encounters" className="text-xs gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Encounters ({encounters.length})
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            Activity Log
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card: Personal & Credentials */}
            <Card className="border-slate-200/90 shadow-2xs">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-indigo-600" />
                  Credentials & Licensing
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Physician Name:</span>
                  <span className="font-semibold text-slate-800">{fullName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Specialty:</span>
                  <span className="font-semibold text-slate-800">
                    {provider.specialty || "General Practice"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">National Provider Identifier (NPI):</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {provider.npi || "—"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Federal Tax ID / EIN:</span>
                  <span className="font-mono text-slate-800">{provider.taxId || "—"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Registry Status:</span>
                  <span className="font-semibold text-teal-700">Credentialed / Active</span>
                </div>
              </CardContent>
            </Card>

            {/* Card: Contact Information */}
            <Card className="border-slate-200/90 shadow-2xs">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-teal-600" />
                  Direct Contact Channels
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Office Phone:</span>
                  <span className="font-semibold text-slate-800">{provider.phone || "—"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Clinic Email:</span>
                  <span className="font-semibold text-slate-800">{provider.email || "—"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Enrolled Since:</span>
                  <span className="text-slate-800">
                    {new Date(provider.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Card: Practice Location */}
            <Card className="border-slate-200/90 shadow-2xs">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-rose-500" />
                  Clinical Practice Location
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2 text-xs">
                {provider.address?.street ? (
                  <div className="space-y-1 text-slate-700">
                    <p className="font-medium text-slate-900">{provider.address.street}</p>
                    <p>
                      {provider.address.city}, {provider.address.state} {provider.address.zip}
                    </p>
                    <p className="text-slate-500">{provider.address.country || "USA"}</p>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No facility address recorded.</p>
                )}
              </CardContent>
            </Card>

            {/* Card: Clinical Practice Statistics */}
            <Card className="border-slate-200/90 shadow-2xs">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-indigo-600" />
                  Clinical Caseload
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-100">
                  <p className="text-[11px] font-medium text-indigo-700">Scheduled Appointments</p>
                  <p className="text-2xl font-bold text-indigo-900 mt-1">
                    {provider._count?.appointments ?? appointments.length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-teal-50/70 border border-teal-100">
                  <p className="text-[11px] font-medium text-teal-700">Completed Encounters</p>
                  <p className="text-2xl font-bold text-teal-900 mt-1">
                    {provider._count?.encounters ?? encounters.length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Appointments */}
        <TabsContent value="appointments" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Appointments for {fullName}
            </h3>
            <Link
              href={`/appointments?providerId=${provider.id}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}
            >
              Open Appointment Schedule
            </Link>
          </div>

          {appointments.length === 0 ? (
            <Card className="border-dashed border-slate-200">
              <CardContent className="p-8 text-center text-xs text-slate-500">
                No appointments currently scheduled with this practitioner.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {apt.patient?.firstName} {apt.patient?.lastName} ({apt.patient?.patientId})
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {new Date(apt.date).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}{" "}
                        • {apt.durationMins} mins • {apt.type || "Visit"}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={apt.status.toLowerCase()} label={apt.status} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Encounters */}
        <TabsContent value="encounters" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Encounters Conducted by {fullName}
            </h3>
            <Link
              href={`/encounters?providerId=${provider.id}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}
            >
              View Full Clinical Ledger
            </Link>
          </div>

          {encounters.length === 0 ? (
            <Card className="border-dashed border-slate-200">
              <CardContent className="p-8 text-center text-xs text-slate-500">
                No encounters recorded for this practitioner yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {encounters.map((enc) => (
                <div
                  key={enc.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-teal-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {enc.patient?.firstName} {enc.patient?.lastName} ({enc.patient?.patientId})
                      </p>
                      <p className="text-[11px] text-slate-500">
                        DOS:{" "}
                        {new Date(enc.dateOfService).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        • {enc.visitType || "Office Visit"}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-medium border border-teal-200">
                    <CheckCircle2 className="h-3 w-3" />
                    {enc.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 4: Activity */}
        <TabsContent value="activity" className="pt-4">
          <Card className="border-slate-200/90 shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-600" />
                Audit Trail & Modifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-3 text-xs">
                <div className="h-2 w-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Provider Record Created</p>
                  <p className="text-slate-500">
                    Registered with NPI {provider.npi || "N/A"} on{" "}
                    {new Date(provider.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {provider.updatedAt && provider.updatedAt !== provider.createdAt && (
                <div className="flex items-start gap-3 text-xs">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800">Credentials Updated</p>
                    <p className="text-slate-500">
                      Modified on {new Date(provider.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Provider Modal */}
      <ProviderForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={provider}
        onSubmit={handleUpdate}
        isSubmitting={updateProviderMutation.isPending}
      />
    </div>
  );
}
