"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, UserCheck } from "lucide-react";
import { usePatient, useUpdatePatient } from "@/hooks/usePatients";
import { PatientForm } from "@/components/forms/PatientForm";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CreatePatientRequest } from "@/types";
import { cn } from "@/lib/utils";

export default function EditPatientPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const { data: patient, isLoading, isError } = usePatient(id);
  const updateMutation = useUpdatePatient();

  const handleUpdate = async (data: CreatePatientRequest) => {
    if (!id) return;
    await updateMutation.mutateAsync({
      id,
      payload: data,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" label="Loading patient record..." />
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <Card className="p-8 text-center bg-rose-50 border-rose-200 max-w-lg mx-auto mt-8">
        <h2 className="text-base font-bold text-rose-800">
          Patient record not found
        </h2>
        <p className="text-xs text-rose-600 mt-1 mb-4">
          The requested patient record could not be loaded or may belong to another tenant.
        </p>
        <Link
          href="/patients"
          className={cn(buttonVariants({ size: "sm" }), "gradient-primary text-white border-0")}
        >
          Return to Patients List
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
            <UserCheck className="h-3.5 w-3.5" />
            <span>MRN: {patient.patientId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Edit Patient Record
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Update demographics, addresses, and contacts for {patient.firstName} {patient.lastName}
          </p>
        </div>

        <Link
          href={`/patients/${id}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "border-slate-200 text-slate-700 inline-flex items-center gap-1.5 self-start sm:self-auto"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Profile</span>
        </Link>
      </div>

      {/* Edit Form */}
      <PatientForm
        initialData={patient}
        onSubmit={handleUpdate}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}
