"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useCreatePatient } from "@/hooks/usePatients";
import { PatientForm } from "@/components/forms/PatientForm";
import { buttonVariants } from "@/components/ui/button";
import { CreatePatientRequest } from "@/types";
import { cn } from "@/lib/utils";

export default function NewPatientPage() {
  const createMutation = useCreatePatient();

  const handleCreate = async (data: CreatePatientRequest) => {
    await createMutation.mutateAsync(data);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
            <UserPlus className="h-3.5 w-3.5" />
            <span>Patient Intake</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Register New Patient
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create an isolated patient account with vital demographics and insurance coverage
          </p>
        </div>

        <Link
          href="/patients"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "border-slate-200 text-slate-700 inline-flex items-center gap-1.5 self-start sm:self-auto"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Patients</span>
        </Link>
      </div>

      {/* Patient Registration Form */}
      <PatientForm
        onSubmit={handleCreate}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
