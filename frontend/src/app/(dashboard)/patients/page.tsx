"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserPlus, Users, UserCheck, UserPlus2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePatients, usePatientStats, useDeactivatePatient } from "@/hooks/usePatients";
import { PatientTable } from "@/components/patients/PatientTable";
import { PatientCard } from "@/components/patients/PatientCard";
import { PatientFilters } from "@/components/patients/PatientFilters";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Patient } from "@/types";
import { cn } from "@/lib/utils";

export default function PatientsPage() {
  const [search, setSearch] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [status, setStatus] = useState<string>("active");
  const [page, setPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Deactivation confirmation modal state
  const [patientToDeactivate, setPatientToDeactivate] = useState<Patient | null>(null);

  // Compute isActive filter from status
  const isActiveFilter =
    status === "active" ? true : status === "inactive" ? false : undefined;

  const { data, isLoading, isError } = usePatients({
    page,
    limit: 15,
    search: search || undefined,
    gender: gender || undefined,
    isActive: isActiveFilter,
    sortBy,
    sortOrder,
  });

  const { data: stats } = usePatientStats();
  const deactivateMutation = useDeactivatePatient();

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setGender("");
    setStatus("active");
    setPage(1);
  };

  const handleConfirmDeactivate = async () => {
    if (!patientToDeactivate) return;
    try {
      await deactivateMutation.mutateAsync(patientToDeactivate.id);
      toast.success(
        `Patient ${patientToDeactivate.firstName} ${patientToDeactivate.lastName} has been deactivated`
      );
      setPatientToDeactivate(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to deactivate patient";
      toast.error(msg);
    }
  };

  const patientsList = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Patients
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your patient records, insurance coverage, and demographic accounts
          </p>
        </div>

        <Link
          href="/patients/new"
          className={cn(
            buttonVariants({ size: "sm" }),
            "gradient-primary text-white border-0 shadow-md inline-flex items-center gap-2 self-start sm:self-auto h-10 px-4"
          )}
        >
          <UserPlus className="h-4 w-4" />
          <span>Add Patient</span>
        </Link>
      </div>

      {/* Organizational Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Patients
            </p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900">
              {stats?.total ?? "—"}
            </p>
          </div>
        </Card>

        <Card className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600 shrink-0">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Records
            </p>
            <p className="text-xl sm:text-2xl font-bold text-teal-700">
              {stats?.active ?? "—"}
            </p>
          </div>
        </Card>

        <Card className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <UserPlus2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              New This Month
            </p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900">
              {stats?.newThisMonth ?? "—"}
            </p>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <PatientFilters
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        gender={gender}
        onGenderChange={(val) => {
          setGender(val);
          setPage(1);
        }}
        status={status}
        onStatusChange={(val) => {
          setStatus(val);
          setPage(1);
        }}
        onReset={handleResetFilters}
      />

      {/* Content State: Error, Empty, or Table / Cards */}
      {isError ? (
        <Card className="p-8 text-center bg-rose-50/50 border-rose-200 rounded-xl">
          <p className="text-sm font-semibold text-rose-700">
            Failed to load patient records. Please verify server connection.
          </p>
        </Card>
      ) : !isLoading && patientsList.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No patients found"
          description={
            search || gender || status !== "active"
              ? "No records matched your search filters. Try clearing your filters."
              : "Start by registering your first patient to begin tracking billing encounters and claims."
          }
          actionLabel={search || gender ? "Clear Filters" : "Register Patient"}
          actionHref={search || gender ? undefined : "/patients/new"}
          onAction={search || gender ? handleResetFilters : undefined}
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <PatientTable
              patients={patientsList}
              isLoading={isLoading}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              onDeactivateClick={(p) => setPatientToDeactivate(p)}
            />
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
            {patientsList.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onDeactivateClick={(p) => setPatientToDeactivate(p)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          <DataTablePagination
            meta={meta}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}

      {/* Deactivate Confirmation Dialog */}
      <Dialog
        open={Boolean(patientToDeactivate)}
        onOpenChange={(open) => !open && setPatientToDeactivate(null)}
      >
        <DialogContent className="max-w-md p-6 bg-white rounded-2xl shadow-xl">
          <DialogHeader className="space-y-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Deactivate Patient Record?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to deactivate{" "}
              <span className="font-semibold text-slate-800">
                {patientToDeactivate?.firstName} {patientToDeactivate?.lastName}
              </span>{" "}
              (MRN: {patientToDeactivate?.patientId})? This will soft-delete the record and retain all historical claims and ledgers for HIPAA audit compliance.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setPatientToDeactivate(null)}
              disabled={deactivateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeactivate}
              disabled={deactivateMutation.isPending}
              className="min-w-[100px]"
            >
              {deactivateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Deactivating...
                </>
              ) : (
                "Deactivate"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
