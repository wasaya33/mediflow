"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Eye,
  Edit,
  UserX,
  ArrowUpDown,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Patient } from "@/types";

interface PatientTableProps {
  patients: Patient[];
  isLoading?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (field: string) => void;
  onDeactivateClick: (patient: Patient) => void;
}

export const PatientTable: React.FC<PatientTableProps> = ({
  patients,
  isLoading = false,
  sortBy,
  sortOrder,
  onSort,
  onDeactivateClick,
}) => {
  const router = useRouter();

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

  const renderSortHeader = (label: string, field: string) => {
    const isActive = sortBy === field;
    return (
      <button
        type="button"
        onClick={() => onSort?.(field)}
        className="flex items-center gap-1.5 hover:text-slate-900 transition-colors focus-visible:outline-none"
      >
        <span>{label}</span>
        <ArrowUpDown
          className={`h-3 w-3 ${
            isActive
              ? sortOrder === "asc"
                ? "text-indigo-600 font-bold rotate-180"
                : "text-indigo-600 font-bold"
              : "text-slate-400"
          }`}
        />
      </button>
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between gap-4 animate-pulse">
            <div className="h-5 w-24 bg-slate-200 rounded" />
            <div className="h-5 w-36 bg-slate-200 rounded" />
            <div className="h-5 w-24 bg-slate-200 rounded" />
            <div className="h-5 w-28 bg-slate-200 rounded" />
            <div className="h-5 w-16 bg-slate-200 rounded" />
            <div className="h-5 w-8 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-subtle overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="border-slate-100">
              <TableHead className="text-xs font-semibold text-slate-700 pl-6 w-32">
                {renderSortHeader("Patient ID", "patientId")}
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-700 min-w-[160px]">
                {renderSortHeader("Name", "lastName")}
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-700 min-w-[140px]">
                {renderSortHeader("DOB / Age", "dob")}
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-700 min-w-[130px]">
                Phone
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-700 min-w-[160px]">
                Email
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-700 w-24">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-700 text-right pr-6 w-16">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => {
              const fullName = `${patient.firstName} ${patient.lastName}`;

              return (
                <TableRow
                  key={patient.id}
                  onClick={() => router.push(`/patients/${patient.id}`)}
                  className="cursor-pointer border-slate-100 hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Patient ID (MRN) */}
                  <TableCell className="pl-6 font-mono text-xs font-bold text-indigo-600">
                    {patient.patientId}
                  </TableCell>

                  {/* Name */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                        {fullName}
                      </span>
                      {patient.insurancePolicies && patient.insurancePolicies.length > 0 && (
                        <span className="text-[11px] text-teal-600 font-medium">
                          {patient.insurancePolicies[0].insurerName}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* DOB / Gender */}
                  <TableCell className="text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{formatDate(patient.dob)}</span>
                      {patient.gender && (
                        <span className="text-slate-400">({patient.gender[0]})</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Phone */}
                  <TableCell className="text-xs text-slate-600 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{patient.phone}</span>
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell className="text-xs text-slate-600">
                    {patient.email ? (
                      <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{patient.email}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">None</span>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <StatusBadge status={patient.isActive} />
                  </TableCell>

                  {/* Actions Dropdown */}
                  <TableCell
                    className="text-right pr-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        aria-label="Patient actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 bg-white shadow-lg border-slate-200 rounded-xl p-1">
                        <DropdownMenuItem
                          onClick={() => router.push(`/patients/${patient.id}`)}
                          className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 cursor-pointer rounded-lg hover:bg-slate-100"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-400" />
                          <span>View Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/patients/${patient.id}/edit`)}
                          className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 cursor-pointer rounded-lg hover:bg-slate-100"
                        >
                          <Edit className="h-3.5 w-3.5 text-slate-400" />
                          <span>Edit Patient</span>
                        </DropdownMenuItem>
                        {patient.isActive && (
                          <>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <DropdownMenuItem
                              onClick={() => onDeactivateClick(patient)}
                              className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-600 cursor-pointer rounded-lg hover:bg-rose-50"
                            >
                              <UserX className="h-3.5 w-3.5 text-rose-500" />
                              <span>Deactivate</span>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PatientTable;
