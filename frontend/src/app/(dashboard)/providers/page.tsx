"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Stethoscope,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  UserX,
  Phone,
  Mail,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import {
  useProviders,
  useProviderStats,
  useCreateProvider,
  useUpdateProvider,
  useDeactivateProvider,
} from "@/hooks/useProviders";
import { Provider, CreateProviderRequest } from "@/types";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchInput } from "@/components/shared/SearchInput";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import { ProviderForm } from "@/components/forms/ProviderForm";
import { cn } from "@/lib/utils";

export default function ProvidersPage() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Search & Filter States
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [status, setStatus] = useState("active");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [deactivatingProvider, setDeactivatingProvider] = useState<Provider | null>(null);

  // API Queries & Mutations
  const { data: statsData, isLoading: isStatsLoading } = useProviderStats();
  const { data: providersData, isLoading, isError, refetch } = useProviders({
    page,
    limit,
    search: search || undefined,
    specialty: specialty !== "all" ? specialty : undefined,
    isActive: status === "active" ? true : status === "inactive" ? false : undefined,
  });

  const createProviderMutation = useCreateProvider();
  const updateProviderMutation = useUpdateProvider();
  const deactivateProviderMutation = useDeactivateProvider();

  const providers = providersData?.data || [];
  const meta = providersData?.meta || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const specialtiesList = statsData?.bySpecialty
    ? Object.keys(statsData.bySpecialty)
    : [];

  const handleOpenCreate = () => {
    setEditingProvider(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (provider: Provider) => {
    setEditingProvider(provider);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (payload: CreateProviderRequest) => {
    try {
      if (editingProvider) {
        await updateProviderMutation.mutateAsync({
          id: editingProvider.id,
          data: payload,
        });
        toast.success(`Dr. ${payload.lastName} updated successfully.`);
      } else {
        await createProviderMutation.mutateAsync(payload);
        toast.success(`Dr. ${payload.lastName} registered successfully.`);
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to save provider.";
      toast.error(errorMsg);
      throw err;
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivatingProvider) return;
    try {
      await deactivateProviderMutation.mutateAsync(deactivatingProvider.id);
      toast.success(
        `Dr. ${deactivatingProvider.firstName} ${deactivatingProvider.lastName} has been deactivated.`
      );
      setDeactivatingProvider(null);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to deactivate provider.";
      toast.error(errorMsg);
    }
  };

  const resetFilters = () => {
    startTransition(() => {
      setSearch("");
      setSpecialty("all");
      setStatus("active");
      setPage(1);
    });
  };

  const hasActiveFilters = Boolean(
    search || (specialty && specialty !== "all") || (status && status !== "active")
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Healthcare Providers
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage physician credentials, NPIs, clinical specialties, and scheduling availability.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="gradient-primary text-white shadow-xs gap-1.5 h-10 px-4 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Provider</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200/90 shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Providers</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {isStatsLoading ? "—" : statsData?.total ?? 0}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Active Practitioners</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {isStatsLoading ? "—" : statsData?.active ?? 0}
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
              <p className="text-xs font-medium text-slate-500">Specialties Represented</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {isStatsLoading ? "—" : specialtiesList.length}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex-1 min-w-[240px] max-w-lg">
          <SearchInput
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Search by provider name, NPI, or specialty..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Specialty Dropdown */}
          <div className="w-44">
            <Select
              value={specialty}
              onValueChange={(val) => {
                setSpecialty(val || "all");
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 text-xs bg-slate-50/70 border-slate-200">
                <SelectValue placeholder="All Specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialtiesList.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Dropdown */}
          <div className="w-36">
            <Select
              value={status}
              onValueChange={(val) => {
                setStatus(val || "all");
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 text-xs bg-slate-50/70 border-slate-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
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

      {/* Main Content Area */}
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
              Unable to load providers
            </h3>
            <p className="text-xs text-rose-600 max-w-sm mx-auto">
              A connection error occurred while querying the server. Please try refreshing.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry Request
            </Button>
          </CardContent>
        </Card>
      ) : providers.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? "No matching providers found" : "No providers registered"}
          description={
            hasActiveFilters
              ? "Try adjusting your search criteria or specialty filters to find results."
              : "Register your practice clinicians and doctors to begin scheduling appointments."
          }
          icon={Stethoscope}
          actionLabel={hasActiveFilters ? "Clear Filters" : "Add First Provider"}
          onAction={hasActiveFilters ? resetFilters : handleOpenCreate}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/70 border-b border-slate-200/80">
                <TableRow>
                  <TableHead className="text-xs font-semibold text-slate-600">Provider Name</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">NPI</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Specialty</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Phone</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Email</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((p) => {
                  const fullName = `Dr. ${p.firstName} ${p.lastName}`;
                  return (
                    <TableRow
                      key={p.id}
                      className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                    >
                      <TableCell className="font-semibold text-slate-900">
                        <Link
                          href={`/providers/${p.id}`}
                          className="hover:text-indigo-600 transition-colors"
                        >
                          {fullName}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">
                        {p.npi || "—"}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                          {p.specialty || "General Practice"}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {p.phone || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {p.email || "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={p.isActive ? "active" : "inactive"}
                          label={p.isActive ? "Active" : "Inactive"}
                        />
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
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel className="text-xs text-slate-500">
                              Provider Actions
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/providers/${p.id}`);
                              }}
                              className="cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5 mr-2 text-slate-400" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit(p);
                              }}
                              className="cursor-pointer"
                            >
                              <Edit className="h-3.5 w-3.5 mr-2 text-slate-400" />
                              Edit Provider
                            </DropdownMenuItem>
                            {p.isActive && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeactivatingProvider(p);
                                  }}
                                  className="text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer"
                                >
                                  <UserX className="h-3.5 w-3.5 mr-2" />
                                  Deactivate
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

          {/* Mobile Cards View */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {providers.map((p) => {
              const fullName = `Dr. ${p.firstName} ${p.lastName}`;
              return (
                <Card key={p.id} className="border-slate-200 shadow-2xs">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/providers/${p.id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                        >
                          {fullName}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500 font-mono">
                            NPI: {p.npi || "N/A"}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-indigo-600 font-medium">
                            {p.specialty || "General"}
                          </span>
                        </div>
                      </div>
                      <StatusBadge
                        status={p.isActive ? "active" : "inactive"}
                        label={p.isActive ? "Active" : "Inactive"}
                      />
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                      {p.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span>{p.phone}</span>
                        </div>
                      )}
                      {p.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          <span className="truncate">{p.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(p)}
                        className="h-8 text-xs text-slate-600"
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                      <Link
                        href={`/providers/${p.id}`}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                          "h-8 text-xs text-indigo-600 font-medium"
                        )}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        View
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination Toolbar */}
          <DataTablePagination
            meta={meta}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </>
      )}

      {/* Provider Create/Edit Dialog */}
      <ProviderForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingProvider}
        onSubmit={handleFormSubmit}
        isSubmitting={createProviderMutation.isPending || updateProviderMutation.isPending}
      />

      {/* Deactivate Confirmation Dialog */}
      <Dialog
        open={Boolean(deactivatingProvider)}
        onOpenChange={(open) => !open && setDeactivatingProvider(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              Deactivate Provider
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Are you sure you want to deactivate{" "}
              <strong className="text-slate-800">
                Dr. {deactivatingProvider?.firstName} {deactivatingProvider?.lastName}
              </strong>
              ? They will no longer appear as an available option for new appointments. Existing
              records will be preserved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeactivatingProvider(null)}
              disabled={deactivateProviderMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDeactivate}
              disabled={deactivateProviderMutation.isPending}
            >
              {deactivateProviderMutation.isPending ? "Deactivating..." : "Confirm Deactivation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
