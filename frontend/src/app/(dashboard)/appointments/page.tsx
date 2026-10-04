"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  RotateCcw,
  AlertTriangle,
  User,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAppointments,
  useAppointmentStats,
  useCreateAppointment,
  useUpdateAppointment,
  useCancelAppointment,
  useMarkNoShow,
} from "@/hooks/useAppointments";
import { useProviders } from "@/hooks/useProviders";
import { Appointment, AppointmentStatus, CreateAppointmentRequest } from "@/types";
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
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { EncounterForm } from "@/components/forms/EncounterForm";
import { useCreateEncounter } from "@/hooks/useEncounters";
import { CreateEncounterRequest } from "@/types";
import { cn } from "@/lib/utils";

export default function AppointmentsPage() {
  const router = useRouter();
  // Filters
  const [providerId, setProviderId] = useState("all");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [cancellingAppointment, setCancellingAppointment] = useState<Appointment | null>(null);
  const [noShowAppointment, setNoShowAppointment] = useState<Appointment | null>(null);

  // Modal for creating encounter directly from completed appointment
  const [encounterAppointment, setEncounterAppointment] = useState<Appointment | null>(null);

  // API Queries & Mutations
  const { data: statsData, isLoading: isStatsLoading } = useAppointmentStats();
  const { data: providersData } = useProviders({ limit: 100, isActive: true });
  const providers = providersData?.data || [];

  const { data: appointmentsData, isLoading, isError, refetch } = useAppointments({
    page,
    limit,
    providerId: providerId !== "all" ? providerId : undefined,
    status: status !== "all" ? (status as AppointmentStatus) : undefined,
  });

  const createAppointmentMutation = useCreateAppointment();
  const updateAppointmentMutation = useUpdateAppointment();
  const cancelAppointmentMutation = useCancelAppointment();
  const markNoShowMutation = useMarkNoShow();
  const createEncounterMutation = useCreateEncounter();

  const appointments = appointmentsData?.data || [];
  const meta = appointmentsData?.meta || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const handleOpenCreate = () => {
    setEditingAppointment(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (apt: Appointment) => {
    setEditingAppointment(apt);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (payload: CreateAppointmentRequest) => {
    try {
      if (editingAppointment) {
        await updateAppointmentMutation.mutateAsync({
          id: editingAppointment.id,
          data: payload,
        });
        toast.success("Appointment updated successfully.");
      } else {
        await createAppointmentMutation.mutateAsync(payload);
        toast.success("Appointment scheduled successfully.");
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to save appointment.";
      toast.error(errorMsg);
      throw err;
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingAppointment) return;
    try {
      await cancelAppointmentMutation.mutateAsync(cancellingAppointment.id);
      toast.success("Appointment has been cancelled.");
      setCancellingAppointment(null);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to cancel appointment.";
      toast.error(errorMsg);
    }
  };

  const handleConfirmNoShow = async () => {
    if (!noShowAppointment) return;
    try {
      await markNoShowMutation.mutateAsync(noShowAppointment.id);
      toast.warning("Appointment marked as Patient No-Show.");
      setNoShowAppointment(null);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to mark no-show.";
      toast.error(errorMsg);
    }
  };

  const handleMarkComplete = async (apt: Appointment) => {
    try {
      await updateAppointmentMutation.mutateAsync({
        id: apt.id,
        data: { status: "COMPLETED" },
      });
      toast.success("Appointment marked as COMPLETED.");
      // Prompt to create clinical encounter
      setEncounterAppointment(apt);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to complete appointment.";
      toast.error(errorMsg);
    }
  };

  const handleEncounterCreated = async (payload: CreateEncounterRequest) => {
    try {
      await createEncounterMutation.mutateAsync(payload);
      toast.success("Clinical Encounter created & documented.");
      setEncounterAppointment(null);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to create encounter.";
      toast.error(errorMsg);
      throw err;
    }
  };

  const resetFilters = () => {
    setProviderId("all");
    setStatus("all");
    setPage(1);
  };

  const hasActiveFilters = Boolean(providerId !== "all" || status !== "all");

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return {
        date: d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        time: d.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
      };
    } catch {
      return { date: "—", time: "—" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Appointments & Scheduling
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Coordinate clinic schedules, track patient attendance, and transition visits into billable encounters.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="gradient-primary text-white shadow-xs gap-1.5 h-10 px-4 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Schedule Appointment</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200/90 shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Today&apos;s Schedule</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {isStatsLoading ? "—" : statsData?.today ?? 0}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">This Week</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {isStatsLoading ? "—" : statsData?.thisWeek ?? 0}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Pending / Scheduled</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {isStatsLoading ? "—" : statsData?.pending ?? 0}
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

          {/* Status Filter */}
          <div className="w-40">
            <Select
              value={status}
              onValueChange={(val) => {
                setStatus(val || "all");
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 text-xs bg-slate-50/70 border-slate-200">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="NO_SHOW">No-Show</SelectItem>
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
              Failed to load appointments
            </h3>
            <p className="text-xs text-rose-600 max-w-sm mx-auto">
              Unable to query the appointment schedule. Please retry.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : appointments.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? "No appointments match your filters" : "No appointments scheduled"}
          description={
            hasActiveFilters
              ? "Clear your provider or status filter to see other booked slots."
              : "Schedule an appointment with a patient and provider to populate the calendar."
          }
          icon={CalendarIcon}
          actionLabel={hasActiveFilters ? "Clear Filters" : "Schedule Appointment"}
          onAction={hasActiveFilters ? resetFilters : handleOpenCreate}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/70 border-b border-slate-200/80">
                <TableRow>
                  <TableHead className="text-xs font-semibold text-slate-600">Date & Time</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Patient</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Attending Provider</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Type</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Duration</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((apt) => {
                  const { date, time } = formatDateTime(apt.date);
                  return (
                    <TableRow
                      key={apt.id}
                      className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                    >
                      <TableCell>
                        <Link
                          href={`/appointments/${apt.id}`}
                          className="font-medium text-slate-900 hover:text-indigo-600"
                        >
                          <div className="font-semibold">{date}</div>
                          <div className="text-xs text-slate-500 font-mono">{time}</div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/patients/${apt.patientId}`}
                          className="font-medium text-slate-900 hover:text-indigo-600 text-xs"
                        >
                          {apt.patient?.firstName} {apt.patient?.lastName}
                          <span className="block text-[11px] text-slate-400 font-mono">
                            MRN: {apt.patient?.patientId}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-xs text-slate-800">
                        <Link
                          href={`/providers/${apt.providerId}`}
                          className="hover:text-indigo-600"
                        >
                          Dr. {apt.provider?.firstName} {apt.provider?.lastName}
                          <span className="block text-[11px] text-slate-400">
                            {apt.provider?.specialty || "General"}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {apt.type || "Consultation"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 font-mono">
                        {apt.durationMins} mins
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={apt.status.toLowerCase()}
                          label={apt.status}
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
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel className="text-xs text-slate-500">
                              Appointment Actions
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/appointments/${apt.id}`);
                              }}
                              className="cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5 mr-2 text-slate-400" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit(apt);
                              }}
                              className="cursor-pointer"
                            >
                              <Edit className="h-3.5 w-3.5 mr-2 text-slate-400" />
                              Edit Booking
                            </DropdownMenuItem>

                            {apt.status === "SCHEDULED" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkComplete(apt);
                                  }}
                                  className="text-teal-700 focus:text-teal-800 focus:bg-teal-50 cursor-pointer"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                                  Mark Complete
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setNoShowAppointment(apt);
                                  }}
                                  className="text-amber-700 focus:text-amber-800 focus:bg-amber-50 cursor-pointer"
                                >
                                  <AlertCircle className="h-3.5 w-3.5 mr-2" />
                                  Mark No-Show
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCancellingAppointment(apt);
                                  }}
                                  className="text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer"
                                >
                                  <XCircle className="h-3.5 w-3.5 mr-2" />
                                  Cancel Appointment
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

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {appointments.map((apt) => {
              const { date, time } = formatDateTime(apt.date);
              return (
                <Card key={apt.id} className="border-slate-200 shadow-2xs">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">
                          {date} at {time}
                        </span>
                        <p className="text-xs text-indigo-600 font-medium mt-0.5">
                          {apt.type || "Consultation"} ({apt.durationMins}m)
                        </p>
                      </div>
                      <StatusBadge status={apt.status.toLowerCase()} label={apt.status} />
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          Patient: {apt.patient?.firstName} {apt.patient?.lastName} (MRN:{" "}
                          {apt.patient?.patientId})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Stethoscope className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          Dr. {apt.provider?.firstName} {apt.provider?.lastName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      {apt.status === "SCHEDULED" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkComplete(apt)}
                          className="h-8 text-xs text-teal-700 hover:bg-teal-50"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Complete
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(apt)}
                        className="h-8 text-xs text-slate-600"
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                      <Link
                        href={`/appointments/${apt.id}`}
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

      {/* Appointment Create/Edit Dialog */}
      <AppointmentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingAppointment}
        onSubmit={handleFormSubmit}
        isSubmitting={createAppointmentMutation.isPending || updateAppointmentMutation.isPending}
      />

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={Boolean(cancellingAppointment)}
        onOpenChange={(open) => !open && setCancellingAppointment(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-rose-500" />
              Cancel Appointment
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Are you sure you want to cancel the appointment for{" "}
              <strong className="text-slate-800">
                {cancellingAppointment?.patient?.firstName} {cancellingAppointment?.patient?.lastName}
              </strong>
              ? This action will mark the slot as cancelled in the clinic calendar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancellingAppointment(null)}
              disabled={cancelAppointmentMutation.isPending}
            >
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmCancel}
              disabled={cancelAppointmentMutation.isPending}
            >
              {cancelAppointmentMutation.isPending ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* No-Show Confirmation Dialog */}
      <Dialog
        open={Boolean(noShowAppointment)}
        onOpenChange={(open) => !open && setNoShowAppointment(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Mark Patient No-Show
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Flag this appointment as a missed visit without prior notice for{" "}
              <strong className="text-slate-800">
                {noShowAppointment?.patient?.firstName} {noShowAppointment?.patient?.lastName}
              </strong>
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNoShowAppointment(null)}
              disabled={markNoShowMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleConfirmNoShow}
              disabled={markNoShowMutation.isPending}
              className="bg-amber-100 text-amber-900 hover:bg-amber-200"
            >
              {markNoShowMutation.isPending ? "Updating..." : "Record No-Show"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Encounter Modal: Triggered when marking an appointment as complete */}
      {encounterAppointment && (
        <EncounterForm
          isOpen={Boolean(encounterAppointment)}
          onClose={() => setEncounterAppointment(null)}
          defaultPatientId={encounterAppointment.patientId}
          defaultProviderId={encounterAppointment.providerId}
          defaultAppointmentId={encounterAppointment.id}
          onSubmit={handleEncounterCreated}
          isSubmitting={createEncounterMutation.isPending}
        />
      )}
    </div>
  );
}
