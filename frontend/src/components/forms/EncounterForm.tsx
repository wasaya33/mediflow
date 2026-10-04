"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText, Loader2, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePatients } from "@/hooks/usePatients";
import { useProviders } from "@/hooks/useProviders";
import { useAppointments } from "@/hooks/useAppointments";
import { Encounter, CreateEncounterRequest } from "@/types";

const encounterSchema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  providerId: z.string().min(1, "Please select an attending provider"),
  appointmentId: z.string().optional(),
  dateOfService: z.string().min(1, "Date of Service is required"),
  visitType: z.string().trim().min(1, "Please select a visit type"),
  notes: z.string().trim().optional(),
});

type EncounterFormData = z.infer<typeof encounterSchema>;

interface EncounterFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Encounter | null;
  defaultPatientId?: string;
  defaultProviderId?: string;
  defaultAppointmentId?: string;
  onSubmit: (data: CreateEncounterRequest) => Promise<unknown>;
  isSubmitting?: boolean;
}

const VISIT_TYPES = [
  "Office Visit",
  "Telehealth Consultation",
  "Initial Inpatient Visit",
  "Subsequent Hospital Care",
  "Emergency Room Evaluation",
  "Preventive Medicine Visit",
  "Home Healthcare Assessment",
  "Consultation",
];

export const EncounterForm: React.FC<EncounterFormProps> = ({
  isOpen,
  onClose,
  initialData,
  defaultPatientId,
  defaultProviderId,
  defaultAppointmentId,
  onSubmit,
  isSubmitting = false,
}) => {
  const isEditing = Boolean(initialData);

  const { data: patientsData, isLoading: isPatientsLoading } = usePatients({
    limit: 100,
    isActive: true,
  });

  const { data: providersData, isLoading: isProvidersLoading } = useProviders({
    limit: 100,
    isActive: true,
  });

  const patients = patientsData?.data || [];
  const providers = providersData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EncounterFormData>({
    resolver: zodResolver(encounterSchema),
    defaultValues: {
      patientId: defaultPatientId || "",
      providerId: defaultProviderId || "",
      appointmentId: defaultAppointmentId || "",
      dateOfService: new Date().toISOString().slice(0, 10),
      visitType: "Office Visit",
      notes: "",
    },
  });

  const selectedPatientId = watch("patientId");
  const selectedProviderId = watch("providerId");
  const selectedAppointmentId = watch("appointmentId");
  const selectedVisitType = watch("visitType");

  // Fetch appointments for selected patient
  const { data: patientAppointmentsData } = useAppointments({
    patientId: selectedPatientId || undefined,
    limit: 20,
  });

  const patientAppointments = (patientAppointmentsData?.data || []).filter(
    (apt) => apt.status === "SCHEDULED" || apt.status === "COMPLETED"
  );

  useEffect(() => {
    if (initialData) {
      const dateStr = initialData.dateOfService
        ? new Date(initialData.dateOfService).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);

      reset({
        patientId: initialData.patientId,
        providerId: initialData.providerId,
        appointmentId: initialData.appointmentId || "",
        dateOfService: dateStr,
        visitType: initialData.visitType || "Office Visit",
        notes: initialData.notes || "",
      });
    } else {
      reset({
        patientId: defaultPatientId || "",
        providerId: defaultProviderId || "",
        appointmentId: defaultAppointmentId || "",
        dateOfService: new Date().toISOString().slice(0, 10),
        visitType: "Office Visit",
        notes: "",
      });
    }
  }, [
    initialData,
    defaultPatientId,
    defaultProviderId,
    defaultAppointmentId,
    reset,
    isOpen,
  ]);

  // When an appointment is selected, auto-fill provider and date if available
  const handleAppointmentSelect = (aptId: string | null) => {
    if (!aptId || aptId === "none") {
      setValue("appointmentId", "", { shouldValidate: true });
      return;
    }

    setValue("appointmentId", aptId, { shouldValidate: true });
    const selectedApt = patientAppointments.find((a) => a.id === aptId);
    if (selectedApt) {
      if (selectedApt.providerId) {
        setValue("providerId", selectedApt.providerId, { shouldValidate: true });
      }
      if (selectedApt.date) {
        setValue(
          "dateOfService",
          new Date(selectedApt.date).toISOString().slice(0, 10),
          { shouldValidate: true }
        );
      }
    }
  };

  const onFormSubmit = async (formData: EncounterFormData) => {
    const payload: CreateEncounterRequest = {
      patientId: formData.patientId,
      providerId: formData.providerId,
      appointmentId:
        formData.appointmentId && formData.appointmentId !== "none"
          ? formData.appointmentId
          : undefined,
      dateOfService: new Date(formData.dateOfService).toISOString(),
      visitType: formData.visitType.trim(),
      notes: formData.notes?.trim() || undefined,
      status: "COMPLETED",
    };

    await onSubmit(payload);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                {isEditing ? "Modify Clinical Encounter" : "Document Clinical Encounter"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Record practitioner encounters, service dates, and visit findings ready for claim generation.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-2">
          {/* Patient Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="encounterPatient" className="text-xs font-semibold text-slate-700">
              Patient Record <span className="text-rose-500">*</span>
            </Label>
            <Select
              value={selectedPatientId || ""}
              onValueChange={(val) => {
                setValue("patientId", val || "", { shouldValidate: true });
                setValue("appointmentId", ""); // Reset linked appointment
              }}
              disabled={isPatientsLoading || isEditing}
            >
              <SelectTrigger id="encounterPatient" className="h-10 text-sm bg-white border-slate-200">
                <SelectValue placeholder={isPatientsLoading ? "Loading patients..." : "Select patient..."} />
              </SelectTrigger>
              <SelectContent>
                {patients.map((pt) => (
                  <SelectItem key={pt.id} value={pt.id}>
                    {pt.firstName} {pt.lastName} (MRN: {pt.patientId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.patientId && (
              <p className="text-[11px] text-rose-500">{errors.patientId.message}</p>
            )}
          </div>

          {/* Optional Appointment Linking */}
          {selectedPatientId && patientAppointments.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="encounterApt" className="text-xs font-semibold text-slate-700">
                Link to Scheduled Appointment (Optional)
              </Label>
              <Select
                value={selectedAppointmentId || "none"}
                onValueChange={handleAppointmentSelect}
              >
                <SelectTrigger id="encounterApt" className="h-10 text-sm bg-slate-50/70 border-slate-200">
                  <SelectValue placeholder="Standalone visit (No scheduled appointment)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Standalone visit (No appointment linked)</SelectItem>
                  {patientAppointments.map((apt) => (
                    <SelectItem key={apt.id} value={apt.id}>
                      {new Date(apt.date).toLocaleDateString()} — {apt.type || "Visit"} (Dr.{" "}
                      {apt.provider?.lastName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Attending Provider */}
          <div className="space-y-1.5">
            <Label htmlFor="encounterProvider" className="text-xs font-semibold text-slate-700">
              Attending Healthcare Provider <span className="text-rose-500">*</span>
            </Label>
            <Select
              value={selectedProviderId || ""}
              onValueChange={(val) => setValue("providerId", val || "", { shouldValidate: true })}
              disabled={isProvidersLoading}
            >
              <SelectTrigger id="encounterProvider" className="h-10 text-sm bg-white border-slate-200">
                <SelectValue placeholder={isProvidersLoading ? "Loading providers..." : "Select provider..."} />
              </SelectTrigger>
              <SelectContent>
                {providers.map((pr) => (
                  <SelectItem key={pr.id} value={pr.id}>
                    Dr. {pr.firstName} {pr.lastName} ({pr.specialty || "General"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.providerId && (
              <p className="text-[11px] text-rose-500">{errors.providerId.message}</p>
            )}
          </div>

          {/* Date of Service & Visit Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="dateOfService" className="text-xs font-semibold text-slate-700">
                Date of Service (DOS) <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="dateOfService"
                type="date"
                {...register("dateOfService")}
                className={errors.dateOfService ? "border-rose-400" : ""}
              />
              {errors.dateOfService && (
                <p className="text-[11px] text-rose-500">{errors.dateOfService.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="visitType" className="text-xs font-semibold text-slate-700">
                Visit Type <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={selectedVisitType || "Office Visit"}
                onValueChange={(val) =>
                  setValue("visitType", val || "Office Visit", { shouldValidate: true })
                }
              >
                <SelectTrigger id="visitType" className="h-10 text-sm bg-white border-slate-200">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {VISIT_TYPES.map((vt) => (
                    <SelectItem key={vt} value={vt}>
                      {vt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.visitType && (
                <p className="text-[11px] text-rose-500">{errors.visitType.message}</p>
              )}
            </div>
          </div>

          {/* Clinical Findings & Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="encounterNotes" className="text-xs font-semibold text-slate-700">
              Clinical Notes & Visit Summary
            </Label>
            <Textarea
              id="encounterNotes"
              rows={4}
              placeholder="Record chief complaint, subjective symptoms, examination findings, and clinical assessment..."
              {...register("notes")}
              className="resize-none text-xs"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gradient-primary text-white shadow-xs gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditing ? "Update Encounter" : "Document Encounter"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
