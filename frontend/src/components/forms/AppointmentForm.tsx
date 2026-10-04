"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar as CalendarIcon, Loader2, Save } from "lucide-react";
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
import { Appointment, CreateAppointmentRequest } from "@/types";

const appointmentSchema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  providerId: z.string().min(1, "Please select a provider"),
  date: z.string().min(1, "Appointment date and time is required"),
  durationMins: z.coerce.number().min(15, "Duration must be at least 15 minutes").max(240, "Duration cannot exceed 240 minutes"),
  type: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Appointment | null;
  defaultPatientId?: string;
  defaultProviderId?: string;
  onSubmit: (data: CreateAppointmentRequest) => Promise<unknown>;
  isSubmitting?: boolean;
}

const APPOINTMENT_TYPES = [
  "General Check-up",
  "Follow-up Consultation",
  "New Patient Evaluation",
  "Specialist Consultation",
  "Post-Op Assessment",
  "Routine Procedure",
  "Telehealth Visit",
  "Other",
];

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  isOpen,
  onClose,
  initialData,
  defaultPatientId,
  defaultProviderId,
  onSubmit,
  isSubmitting = false,
}) => {
  const isEditing = Boolean(initialData);

  // Fetch active patients & providers for select dropdowns
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
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: defaultPatientId || "",
      providerId: defaultProviderId || "",
      date: "",
      durationMins: 30,
      type: "Follow-up Consultation",
      notes: "",
    },
  });

  const selectedPatientId = watch("patientId");
  const selectedProviderId = watch("providerId");
  const selectedDuration = watch("durationMins");
  const selectedType = watch("type");

  useEffect(() => {
    if (initialData) {
      // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
      let formattedDate = "";
      try {
        const d = new Date(initialData.date);
        formattedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
      } catch {
        formattedDate = "";
      }

      reset({
        patientId: initialData.patientId,
        providerId: initialData.providerId,
        date: formattedDate,
        durationMins: initialData.durationMins || 30,
        type: initialData.type || "Follow-up Consultation",
        notes: initialData.notes || "",
      });
    } else {
      // Default to tomorrow 10:00 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      const defaultDateStr = new Date(
        tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16);

      reset({
        patientId: defaultPatientId || "",
        providerId: defaultProviderId || "",
        date: defaultDateStr,
        durationMins: 30,
        type: "Follow-up Consultation",
        notes: "",
      });
    }
  }, [initialData, defaultPatientId, defaultProviderId, reset, isOpen]);

  const onFormSubmit = async (formData: AppointmentFormData) => {
    const payload: CreateAppointmentRequest = {
      patientId: formData.patientId,
      providerId: formData.providerId,
      date: new Date(formData.date).toISOString(),
      durationMins: Number(formData.durationMins) || 30,
      type: formData.type?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
    };

    await onSubmit(payload);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                {isEditing ? "Modify Appointment" : "Schedule New Appointment"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {isEditing
                  ? "Update appointment time or clinical notes."
                  : "Book a clinical session between an enrolled patient and healthcare practitioner."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-2">
          {/* Patient Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="patientSelect" className="text-xs font-semibold text-slate-700">
              Patient <span className="text-rose-500">*</span>
            </Label>
            <Select
              value={selectedPatientId || ""}
              onValueChange={(val) => setValue("patientId", val || "", { shouldValidate: true })}
              disabled={isPatientsLoading}
            >
              <SelectTrigger id="patientSelect" className="h-10 text-sm bg-white border-slate-200">
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

          {/* Provider Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="providerSelect" className="text-xs font-semibold text-slate-700">
              Attending Healthcare Provider <span className="text-rose-500">*</span>
            </Label>
            <Select
              value={selectedProviderId || ""}
              onValueChange={(val) => setValue("providerId", val || "", { shouldValidate: true })}
              disabled={isProvidersLoading}
            >
              <SelectTrigger id="providerSelect" className="h-10 text-sm bg-white border-slate-200">
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

          {/* Date & Time and Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="appointmentDate" className="text-xs font-semibold text-slate-700">
                Date & Time <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="appointmentDate"
                type="datetime-local"
                {...register("date")}
                className={errors.date ? "border-rose-400" : ""}
              />
              {errors.date && (
                <p className="text-[11px] text-rose-500">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="duration" className="text-xs font-semibold text-slate-700">
                Duration
              </Label>
              <Select
                value={String(selectedDuration || 30)}
                onValueChange={(val) =>
                  setValue("durationMins", Number(val) || 30, { shouldValidate: true })
                }
              >
                <SelectTrigger id="duration" className="h-10 text-sm bg-white border-slate-200">
                  <SelectValue placeholder="30 Minutes" />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((mins) => (
                    <SelectItem key={mins} value={String(mins)}>
                      {mins} Minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Appointment Type */}
          <div className="space-y-1.5">
            <Label htmlFor="type" className="text-xs font-semibold text-slate-700">
              Visit Purpose / Type
            </Label>
            <Select
              value={selectedType || ""}
              onValueChange={(val) => setValue("type", val || "", { shouldValidate: true })}
            >
              <SelectTrigger id="type" className="h-10 text-sm bg-white border-slate-200">
                <SelectValue placeholder="Select appointment type" />
              </SelectTrigger>
              <SelectContent>
                {APPOINTMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clinical Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-semibold text-slate-700">
              Clinical & Scheduling Notes
            </Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="e.g. Patient requests blood pressure check and prescription renewal..."
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
                  {isEditing ? "Update Appointment" : "Confirm Booking"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
