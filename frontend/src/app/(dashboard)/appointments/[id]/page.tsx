"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Stethoscope,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit,
  FileText,
  FileCheck2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAppointment,
  useUpdateAppointment,
  useCancelAppointment,
  useMarkNoShow,
} from "@/hooks/useAppointments";
import { useCreateEncounter } from "@/hooks/useEncounters";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { EncounterForm } from "@/components/forms/EncounterForm";
import { CreateAppointmentRequest, CreateEncounterRequest } from "@/types";
import { cn } from "@/lib/utils";

export default function AppointmentDetailsPage() {
  const params = useParams();
  const appointmentId = String(params.id);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEncounterFormOpen, setIsEncounterFormOpen] = useState(false);

  const { data: appointment, isLoading, isError } = useAppointment(appointmentId);
  const updateAppointmentMutation = useUpdateAppointment();
  const cancelAppointmentMutation = useCancelAppointment();
  const markNoShowMutation = useMarkNoShow();
  const createEncounterMutation = useCreateEncounter();

  const handleUpdate = async (payload: CreateAppointmentRequest) => {
    try {
      await updateAppointmentMutation.mutateAsync({
        id: appointmentId,
        data: payload,
      });
      toast.success("Appointment updated successfully.");
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to update appointment.";
      toast.error(errorMsg);
      throw err;
    }
  };

  const handleMarkComplete = async () => {
    try {
      await updateAppointmentMutation.mutateAsync({
        id: appointmentId,
        data: { status: "COMPLETED" },
      });
      toast.success("Appointment marked as COMPLETED.");
      setIsEncounterFormOpen(true);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to complete appointment.";
      toast.error(errorMsg);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelAppointmentMutation.mutateAsync(appointmentId);
      toast.success("Appointment has been cancelled.");
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to cancel appointment.";
      toast.error(errorMsg);
    }
  };

  const handleNoShow = async () => {
    try {
      await markNoShowMutation.mutateAsync(appointmentId);
      toast.warning("Appointment marked as No-Show.");
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to record no-show.";
      toast.error(errorMsg);
    }
  };

  const handleEncounterSubmit = async (payload: CreateEncounterRequest) => {
    try {
      await createEncounterMutation.mutateAsync(payload);
      toast.success("Encounter documentation recorded.");
      setIsEncounterFormOpen(false);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to record encounter.";
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

  if (isError || !appointment) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
          <Calendar className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Appointment Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested booking does not exist or has been removed.
        </p>
        <Link
          href="/appointments"
          className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Appointments
        </Link>
      </div>
    );
  }

  const d = new Date(appointment.date);
  const formattedDate = d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/appointments"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Back to Appointments
        </Link>
      </div>

      {/* Header Banner */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Calendar className="h-7 w-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {formattedDate}
                </h1>
                <StatusBadge
                  status={appointment.status.toLowerCase()}
                  label={appointment.status}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-600">
                <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold border border-indigo-200/60">
                  {formattedTime} ({appointment.durationMins} mins)
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-medium text-slate-700">
                  {appointment.type || "Clinical Visit"}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {appointment.status === "SCHEDULED" && (
              <>
                <Button
                  onClick={handleMarkComplete}
                  className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5 h-9"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark Complete
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNoShow}
                  className="text-amber-700 border-amber-300 hover:bg-amber-50 h-9 gap-1.5"
                >
                  <AlertCircle className="h-4 w-4" />
                  No-Show
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="text-rose-600 border-rose-200 hover:bg-rose-50 h-9 gap-1.5"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel
                </Button>
              </>
            )}
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(true)}
              className="gap-1.5 h-9"
            >
              <Edit className="h-4 w-4" />
              Edit Booking
            </Button>
          </div>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Patient Details */}
        <Card className="border-slate-200/90 shadow-2xs">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-600" />
              Patient Details
            </CardTitle>
            <Link
              href={`/patients/${appointment.patientId}`}
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              Full Profile →
            </Link>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Name:</span>
              <span className="font-semibold text-slate-800">
                {appointment.patient?.firstName} {appointment.patient?.lastName}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">MRN:</span>
              <span className="font-mono font-medium text-slate-800">
                {appointment.patient?.patientId}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Phone:</span>
              <span className="text-slate-800">{appointment.patient?.phone || "—"}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">Email:</span>
              <span className="text-slate-800 truncate max-w-[160px]">
                {appointment.patient?.email || "—"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Attending Provider */}
        <Card className="border-slate-200/90 shadow-2xs">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-teal-600" />
              Attending Provider
            </CardTitle>
            <Link
              href={`/providers/${appointment.providerId}`}
              className="text-xs text-teal-600 hover:underline font-medium"
            >
              Provider Card →
            </Link>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Physician:</span>
              <span className="font-semibold text-slate-800">
                Dr. {appointment.provider?.firstName} {appointment.provider?.lastName}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Specialty:</span>
              <span className="font-medium text-slate-800">
                {appointment.provider?.specialty || "General Practice"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">NPI:</span>
              <span className="font-mono text-slate-800">
                {appointment.provider?.npi || "—"}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">Contact:</span>
              <span className="text-slate-800">
                {appointment.provider?.phone || appointment.provider?.email || "—"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Schedule Specs */}
        <Card className="border-slate-200/90 shadow-2xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-600" />
              Session Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Visit Type:</span>
              <span className="font-semibold text-slate-800">
                {appointment.type || "Routine Visit"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Duration:</span>
              <span className="font-semibold text-slate-800">
                {appointment.durationMins} minutes
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Booked On:</span>
              <span className="text-slate-800">
                {new Date(appointment.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">Status:</span>
              <span className="font-bold text-slate-800">{appointment.status}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clinical Notes & Linked Encounters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Notes */}
        <Card className="border-slate-200/90 shadow-2xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-600" />
              Scheduling & Clinical Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
            {appointment.notes ? (
              appointment.notes
            ) : (
              <span className="text-slate-400 italic">No notes provided for this visit.</span>
            )}
          </CardContent>
        </Card>

        {/* Linked Encounters */}
        <Card className="border-slate-200/90 shadow-2xs">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-teal-600" />
              Generated Encounters
            </CardTitle>
            {(!appointment.encounters || appointment.encounters.length === 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEncounterFormOpen(true)}
                className="text-xs h-7 text-teal-700"
              >
                + Create Encounter
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-4">
            {appointment.encounters && appointment.encounters.length > 0 ? (
              <div className="space-y-2">
                {appointment.encounters.map((enc) => (
                  <div
                    key={enc.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-teal-200 bg-teal-50/50"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {enc.visitType || "Documented Visit"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        DOS: {new Date(enc.dateOfService).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      href={`/encounters/${enc.id}`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "text-xs font-semibold text-teal-700 hover:text-teal-800"
                      )}
                    >
                      View Encounter →
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                No encounter documented yet. Click above to convert this appointment into an
                encounter for billing.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Appointment Edit Dialog */}
      <AppointmentForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={appointment}
        onSubmit={handleUpdate}
        isSubmitting={updateAppointmentMutation.isPending}
      />

      {/* Encounter Form Modal */}
      <EncounterForm
        isOpen={isEncounterFormOpen}
        onClose={() => setIsEncounterFormOpen(false)}
        defaultPatientId={appointment.patientId}
        defaultProviderId={appointment.providerId}
        defaultAppointmentId={appointment.id}
        onSubmit={handleEncounterSubmit}
        isSubmitting={createEncounterMutation.isPending}
      />
    </div>
  );
}
