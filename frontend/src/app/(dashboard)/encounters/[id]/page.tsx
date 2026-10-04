"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Calendar,
  User,
  Stethoscope,
  Edit,
  CreditCard,
  Folder,
  Activity,
  CheckCircle2,
  Receipt,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useEncounter, useUpdateEncounter } from "@/hooks/useEncounters";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EncounterForm } from "@/components/forms/EncounterForm";
import { CreateEncounterRequest } from "@/types";
import { cn } from "@/lib/utils";

export default function EncounterDetailsPage() {
  const params = useParams();
  const encounterId = String(params.id);

  const [activeTab, setActiveTab] = useState("overview");
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: encounter, isLoading, isError } = useEncounter(encounterId);
  const updateEncounterMutation = useUpdateEncounter();

  const handleUpdate = async (payload: CreateEncounterRequest) => {
    try {
      await updateEncounterMutation.mutateAsync({
        id: encounterId,
        data: payload,
      });
      toast.success("Encounter documentation updated.");
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to update encounter.";
      toast.error(errorMsg);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-slate-200/70 animate-pulse rounded-lg" />
        <div className="h-28 w-full bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-44 bg-slate-100 animate-pulse rounded-xl" />
          <div className="h-44 bg-slate-100 animate-pulse rounded-xl" />
          <div className="h-44 bg-slate-100 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !encounter) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
          <FileText className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Encounter Record Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested encounter does not exist or you do not have permission to view it.
        </p>
        <Link
          href="/encounters"
          className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Encounters
        </Link>
      </div>
    );
  }

  const dosDate = new Date(encounter.dateOfService);
  const formattedDOS = dosDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const claims = encounter.claims || [];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/encounters"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Back to Encounters
        </Link>
      </div>

      {/* Header Banner */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shrink-0 shadow-2xs">
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Encounter: {formattedDOS}
                </h1>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {encounter.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-600">
                <span className="font-semibold text-teal-800 bg-teal-50/80 px-2 py-0.5 rounded border border-teal-200/60">
                  {encounter.visitType || "Office Visit"}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-700 font-medium">
                  Patient: {encounter.patient?.firstName} {encounter.patient?.lastName}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-700 font-medium">
                  Attending: Dr. {encounter.provider?.firstName} {encounter.provider?.lastName}
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setIsEditOpen(true)}
            variant="outline"
            className="self-start sm:self-auto gap-1.5 h-9"
          >
            <Edit className="h-4 w-4" />
            Edit Documentation
          </Button>
        </div>
      </div>

      {/* Three Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Patient Profile */}
        <Card className="border-slate-200/90 shadow-2xs">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-600" />
              Patient Identity
            </CardTitle>
            <Link
              href={`/patients/${encounter.patientId}`}
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              Patient File →
            </Link>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Name:</span>
              <span className="font-semibold text-slate-800">
                {encounter.patient?.firstName} {encounter.patient?.lastName}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">MRN:</span>
              <span className="font-mono font-medium text-slate-800">
                {encounter.patient?.patientId}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">DOB:</span>
              <span className="text-slate-800">
                {encounter.patient?.dob
                  ? new Date(encounter.patient.dob).toLocaleDateString()
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">Primary Insurance:</span>
              <span className="font-medium text-teal-700 truncate max-w-[150px]">
                {encounter.patient?.insurancePolicies?.[0]?.insurerName || "Self-Pay"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Attending Provider */}
        <Card className="border-slate-200/90 shadow-2xs">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-teal-600" />
              Attending Clinician
            </CardTitle>
            <Link
              href={`/providers/${encounter.providerId}`}
              className="text-xs text-teal-600 hover:underline font-medium"
            >
              Provider Card →
            </Link>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Physician:</span>
              <span className="font-semibold text-slate-800">
                Dr. {encounter.provider?.firstName} {encounter.provider?.lastName}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Specialty:</span>
              <span className="text-slate-800 font-medium">
                {encounter.provider?.specialty || "General Practice"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">NPI:</span>
              <span className="font-mono text-slate-800">
                {encounter.provider?.npi || "—"}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">Clinic Contact:</span>
              <span className="text-slate-800">
                {encounter.provider?.phone || encounter.provider?.email || "—"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Encounter Parameters */}
        <Card className="border-slate-200/90 shadow-2xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-600" />
              Service Metadata
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Date of Service:</span>
              <span className="font-semibold text-slate-800">
                {dosDate.toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Visit Type:</span>
              <span className="font-semibold text-slate-800">
                {encounter.visitType || "Office Visit"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Linked Appointment:</span>
              {encounter.appointmentId ? (
                <Link
                  href={`/appointments/${encounter.appointmentId}`}
                  className="font-medium text-indigo-600 hover:underline"
                >
                  View Booking →
                </Link>
              ) : (
                <span className="text-slate-400 italic">Direct Walk-in</span>
              )}
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">Billing State:</span>
              <span className="font-bold text-teal-700">Ready for Claim Prep</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100/90 border border-slate-200/80 p-1 rounded-xl">
          <TabsTrigger value="overview" className="text-xs gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Clinical Notes
          </TabsTrigger>
          <TabsTrigger value="claims" className="text-xs gap-1.5">
            <Receipt className="h-3.5 w-3.5" />
            Billing Claims ({claims.length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs gap-1.5">
            <Folder className="h-3.5 w-3.5" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            Activity
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Clinical Notes */}
        <TabsContent value="overview" className="space-y-4 pt-4">
          <Card className="border-slate-200/90 shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-teal-600" />
                Documented Clinical Narrative & Exam Findings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {encounter.notes ? (
                <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                  {encounter.notes}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No detailed narrative was recorded for this encounter.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Claims (Phase 3 Link) */}
        <TabsContent value="claims" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Associated Insurance Claims
            </h3>
            <Link
              href="/claims"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}
            >
              Open Claims Center
            </Link>
          </div>

          {claims.length === 0 ? (
            <Card className="border-dashed border-slate-200">
              <CardContent className="p-8 text-center space-y-2">
                <CreditCard className="h-8 w-8 text-slate-300 mx-auto" />
                <h4 className="text-xs font-semibold text-slate-700">
                  No claims generated for this encounter yet
                </h4>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Encounter is documented and ready. In Phase 3, you will be able to convert this
                  encounter directly into CMS-1500 / 837P claims for clearinghouse submission.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white"
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {claim.claimNumber}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Amount: ${claim.totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {claim.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Documents */}
        <TabsContent value="documents" className="pt-4">
          <Card className="border-dashed border-slate-200">
            <CardContent className="p-8 text-center text-xs text-slate-500">
              Clinical attachments and encounter lab reports will be attached here.
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Activity */}
        <TabsContent value="activity" className="pt-4">
          <Card className="border-slate-200/90 shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-600" />
                Clinical Audit History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Encounter Documented</p>
                  <p className="text-slate-500">
                    Created on {new Date(encounter.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {encounter.updatedAt && encounter.updatedAt !== encounter.createdAt && (
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800">Documentation Revised</p>
                    <p className="text-slate-500">
                      Last modified on {new Date(encounter.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      <EncounterForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={encounter}
        onSubmit={handleUpdate}
        isSubmitting={updateEncounterMutation.isPending}
      />
    </div>
  );
}
