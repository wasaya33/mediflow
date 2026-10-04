"use client";

import React from "react";
import Link from "next/link";
import { Phone, Mail, Calendar, ChevronRight, Edit, UserX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Patient } from "@/types";
import { cn } from "@/lib/utils";

interface PatientCardProps {
  patient: Patient;
  onDeactivateClick: (patient: Patient) => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onDeactivateClick,
}) => {
  const fullName = `${patient.firstName} ${patient.lastName}`;

  const formatDate = (isoString?: string) => {
    if (!isoString) return "—";
    try {
      return new Date(isoString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <Card className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden transition-all hover:shadow-card">
      <CardContent className="p-4 space-y-3">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <span className="font-mono text-xs font-bold text-indigo-600">
              {patient.patientId}
            </span>
            <Link
              href={`/patients/${patient.id}`}
              className="block font-bold text-slate-900 text-base hover:text-indigo-600 transition-colors"
            >
              {fullName}
            </Link>
          </div>
          <StatusBadge status={patient.isActive} />
        </div>

        {/* Details list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>
              {formatDate(patient.dob)} {patient.gender ? `(${patient.gender})` : ""}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{patient.phone}</span>
          </div>

          {patient.email && (
            <div className="flex items-center gap-2 truncate sm:col-span-2">
              <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{patient.email}</span>
            </div>
          )}

          {patient.insurancePolicies && patient.insurancePolicies.length > 0 && (
            <div className="sm:col-span-2 text-[11px] text-teal-700 bg-teal-50/70 border border-teal-200/60 rounded px-2 py-0.5 mt-1 font-medium">
              Primary: {patient.insurancePolicies[0].insurerName} (ID: {patient.insurancePolicies[0].memberId})
            </div>
          )}
        </div>

        {/* Actions bottom row */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Link
              href={`/patients/${patient.id}/edit`}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 text-xs text-slate-600 hover:text-slate-900"
              )}
            >
              <Edit className="h-3.5 w-3.5 mr-1 text-slate-400" />
              Edit
            </Link>
            {patient.isActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeactivateClick(patient)}
                className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              >
                <UserX className="h-3.5 w-3.5 mr-1" />
                Deactivate
              </Button>
            )}
          </div>

          <Link
            href={`/patients/${patient.id}`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-8 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            )}
          >
            <span>View</span>
            <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientCard;
