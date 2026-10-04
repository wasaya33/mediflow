"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Calendar,
  MoreVertical,
  Eye,
  Edit,
  RotateCcw,
  AlertTriangle,
  User,
  Stethoscope,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useEncounters,
  useEncounterStats,
  useCreateEncounter,
  useUpdateEncounter,
} from "@/hooks/useEncounters";
import { useProviders } from "@/hooks/useProviders";
import { Encounter, CreateEncounterRequest } from "@/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import { EncounterForm } from "@/components/forms/EncounterForm";
import { cn } from "@/lib/utils";

export default function EncountersPage() {
  const router = useRouter();
  const [providerId, setProviderId] = useState("all");
  const [visitType, setVisitType] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEncounter, setEditingEncounter] = useState<Encounter | null>(null);

  // Stats & Provider dropdown
  const { data: statsData, isLoading: isStatsLoading } = useEncounterStats();
  const { data: providersData } = useProviders({ limit: 100, isActive: true });
  const providers = providersData?.data || [];

  const { data: encountersData, isLoading, isError, refetch } = useEncounters({
    page,
    limit,
    providerId: providerId !== "all" ? providerId : undefined,
    visitType: visitType !== "all" ? visitType : undefined,
  });

  const createEncounterMutation = useCreateEncounter();
  const updateEncounterMutation = useUpdateEncounter();

  const encounters = encountersData?.data || [];
  const meta = encountersData?.meta || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const visitTypesList = statsData?.byVisitType
    ? Object.keys(statsData.byVisitType)
    : [
        "Office Visit",
        "Telehealth Consultation",
        "Initial Inpatient Visit",
        "Preventive Medicine Visit",
      ];

  const handleOpenCreate = () => {
    setEditingEncounter(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (enc: Encounter) => {
    setEditingEncounter(enc);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (payload: CreateEncounterRequest) => {
    try {
      if (editingEncounter) {
        await updateEncounterMutation.mutateAsync({
          id: editingEncounter.id,
          data: payload,
        });
        toast.success("Encounter documentation updated.");
      } else {
        await createEncounterMutation.mutateAsync(payload);
        toast.success("Clinical encounter documented successfully.");
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to record encounter.";
      toast.error(errorMsg);
      throw err;
    }
  };

  const resetFilters = () => {
    setProviderId("all");
    setVisitType("all");
    setPage(1);
  };

  const hasActiveFilters = Boolean(providerId !== "all" || visitType !== "all");

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Clinical Encounters
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review documented clinical visits, service dates, notes, and ready-to-bill patient interactions.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="gradient-primary text-white shadow-xs gap-1.5 h-10 px-4 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Encounter</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200/90 shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Encounters</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {isStatsLoading ? "—" : statsData?.total ?? 0}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Documented This Month</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {isStatsLoading ? "—" : statsData?.thisMonth ?? 0}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Visit Types</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {isStatsLoading ? "—" : Object.keys(statsData?.byVisitType || {}).length || 4}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Provider Filter */}
          <div className="w-52">
            <Select
              value={providerId}
              onValueChange={(val) => {
                setProviderId(val || "all");
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 text-xs bg-slate-50/70 border-slate-200">
                <SelectValue placeholder="All Providers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Attending Providers</SelectItem>
                {providers.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    Dr. {p.firstName} {p.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Visit Type Filter */}
          <div className="w-48">
            <Select
              value={visitType}
              onValueChange={(val) => {
                setVisitType(val || "all");
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 text-xs bg-slate-50/70 border-slate-200">
                <SelectValue placeholder="All Visit Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Visit Types</SelectItem>
                {visitTypesList.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-10 text-xs text-slate-500 hover:text-slate-900 gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Table / Cards Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 w-full rounded-xl bg-slate-100/80 animate-pulse border border-slate-200/60"
            />
          ))}
        </div>
      ) : isError ? (
        <Card className="border-rose-200 bg-rose-50/50">
          <CardContent className="p-8 text-center space-y-3">
            <AlertTriangle className="h-8 w-8 text-rose-500 mx-auto" />
            <h3 className="text-sm font-semibold text-rose-900">
              Unable to load encounters
            </h3>
            <p className="text-xs text-rose-600 max-w-sm mx-auto">
              A connection error occurred while querying the server. Please try refreshing.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : encounters.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? "No encounters match your filters" : "No encounters recorded yet"}
          description={
            hasActiveFilters
              ? "Try resetting your provider or visit type filters."
              : "Document a clinical encounter from completed appointments or as a standalone visit."
          }
          icon={FileText}
          actionLabel={hasActiveFilters ? "Clear Filters" : "Document First Encounter"}
          onAction={hasActiveFilters ? resetFilters : handleOpenCreate}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/70 border-b border-slate-200/80">
                <TableRow>
                  <TableHead className="text-xs font-semibold text-slate-600">Date of Service</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Patient</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Attending Provider</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Visit Type</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Clinical Notes</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {encounters.map((enc) => (
                  <TableRow
                    key={enc.id}
                    className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                  >
                    <TableCell>
                      <Link
                        href={`/encounters/${enc.id}`}
                        className="font-semibold text-slate-900 hover:text-teal-700"
                      >
                        {formatDate(enc.dateOfService)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/patients/${enc.patientId}`}
                        className="font-medium text-slate-900 hover:text-teal-700 text-xs"
                      >
                        {enc.patient?.firstName} {enc.patient?.lastName}
                        <span className="block text-[11px] text-slate-400 font-mono">
                          MRN: {enc.patient?.patientId}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs text-slate-800">
                      <Link
                        href={`/providers/${enc.providerId}`}
                        className="hover:text-teal-700"
                      >
                        Dr. {enc.provider?.firstName} {enc.provider?.lastName}
                        <span className="block text-[11px] text-slate-400">
                          {enc.provider?.specialty || "General"}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200/70">
                        {enc.visitType || "Office Visit"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 max-w-xs truncate">
                      {enc.notes || "—"}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-[11px] text-teal-700 font-semibold bg-teal-50/80 px-2 py-0.5 rounded border border-teal-200">
                        <CheckCircle2 className="h-3 w-3" />
                        {enc.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          onClick={(e) => e.stopPropagation()}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "icon-sm" }),
                            "text-slate-400 hover:text-slate-700"
                          )}
                        >
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel className="text-xs text-slate-500">
                            Encounter
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/encounters/${enc.id}`);
                            }}
                            className="cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 mr-2 text-slate-400" />
                            View Encounter
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(enc);
                            }}
                            className="cursor-pointer"
                          >
                            <Edit className="h-3.5 w-3.5 mr-2 text-slate-400" />
                            Edit Documentation
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards View */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {encounters.map((enc) => (
              <Card key={enc.id} className="border-slate-200 shadow-2xs">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">
                        DOS: {formatDate(enc.dateOfService)}
                      </span>
                      <p className="text-xs text-teal-700 font-medium mt-0.5">
                        {enc.visitType || "Office Visit"}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] text-teal-700 font-medium bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      <CheckCircle2 className="h-3 w-3" />
                      {enc.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span>
                        Patient: {enc.patient?.firstName} {enc.patient?.lastName} (MRN:{" "}
                        {enc.patient?.patientId})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Stethoscope className="h-3.5 w-3.5 text-slate-400" />
                      <span>
                        Dr. {enc.provider?.firstName} {enc.provider?.lastName}
                      </span>
                    </div>
                    {enc.notes && (
                      <p className="text-slate-500 italic line-clamp-2 mt-1">
                        &quot;{enc.notes}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(enc)}
                      className="h-8 text-xs text-slate-600"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Link
                      href={`/encounters/${enc.id}`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "h-8 text-xs text-teal-700 font-medium"
                      )}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      View
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Toolbar */}
          <DataTablePagination
            meta={meta}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </>
      )}

      {/* Encounter Form Modal */}
      <EncounterForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingEncounter}
        onSubmit={handleFormSubmit}
        isSubmitting={createEncounterMutation.isPending || updateEncounterMutation.isPending}
      />
    </div>
  );
}
