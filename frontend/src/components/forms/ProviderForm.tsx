"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Stethoscope, Loader2, Save } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Provider, CreateProviderRequest } from "@/types";

const providerSchema = z.object({
  firstName: z.string().trim().min(2, "First name must be at least 2 characters"),
  lastName: z.string().trim().min(2, "Last name must be at least 2 characters"),
  npi: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "NPI must be exactly 10 digits")
    .optional()
    .or(z.literal("")),
  specialty: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  taxId: z.string().trim().optional(),
  street: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  zip: z.string().trim().optional(),
  country: z.string().trim().optional(),
});

type ProviderFormData = z.infer<typeof providerSchema>;

interface ProviderFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Provider | null;
  onSubmit: (data: CreateProviderRequest) => Promise<unknown>;
  isSubmitting?: boolean;
}

const COMMON_SPECIALTIES = [
  "Internal Medicine",
  "Family Medicine",
  "Cardiology",
  "Pediatrics",
  "Orthopedic Surgery",
  "Dermatology",
  "Neurology",
  "Obstetrics & Gynecology",
  "Psychiatry",
  "General Surgery",
  "Emergency Medicine",
  "Physical Therapy",
  "Other",
];

export const ProviderForm: React.FC<ProviderFormProps> = ({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  isSubmitting = false,
}) => {
  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      npi: "",
      specialty: "",
      phone: "",
      email: "",
      taxId: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "USA",
    },
  });

  const selectedSpecialty = watch("specialty");

  useEffect(() => {
    if (initialData) {
      reset({
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        npi: initialData.npi || "",
        specialty: initialData.specialty || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        taxId: initialData.taxId || "",
        street: initialData.address?.street || "",
        city: initialData.address?.city || "",
        state: initialData.address?.state || "",
        zip: initialData.address?.zip || "",
        country: initialData.address?.country || "USA",
      });
    } else {
      reset({
        firstName: "",
        lastName: "",
        npi: "",
        specialty: "",
        phone: "",
        email: "",
        taxId: "",
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "USA",
      });
    }
  }, [initialData, reset, isOpen]);

  const onFormSubmit = async (formData: ProviderFormData) => {
    const payload: CreateProviderRequest = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      npi: formData.npi?.trim() || undefined,
      specialty: formData.specialty?.trim() || undefined,
      phone: formData.phone?.trim() || undefined,
      email: formData.email?.trim() || undefined,
      taxId: formData.taxId?.trim() || undefined,
      address: {
        street: formData.street?.trim() || undefined,
        city: formData.city?.trim() || undefined,
        state: formData.state?.trim() || undefined,
        zip: formData.zip?.trim() || undefined,
        country: formData.country?.trim() || "USA",
      },
    };

    await onSubmit(payload);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                {isEditing ? "Edit Provider" : "Add Healthcare Provider"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {isEditing
                  ? "Update provider licensing credentials and clinic contact details."
                  : "Register a physician or clinician to enable appointments and encounter billing."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5 py-2">
          {/* Section: Personal Info */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Physician Identification
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-semibold text-slate-700">
                  First Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="e.g. Robert"
                  {...register("firstName")}
                  className={errors.firstName ? "border-rose-400" : ""}
                />
                {errors.firstName && (
                  <p className="text-[11px] text-rose-500">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-semibold text-slate-700">
                  Last Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="e.g. Chen"
                  {...register("lastName")}
                  className={errors.lastName ? "border-rose-400" : ""}
                />
                {errors.lastName && (
                  <p className="text-[11px] text-rose-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section: Professional Credentials */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Credentials & Specialty
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="npi" className="text-xs font-semibold text-slate-700">
                  NPI (10 digits)
                </Label>
                <Input
                  id="npi"
                  placeholder="1234567890"
                  maxLength={10}
                  {...register("npi")}
                  className={errors.npi ? "border-rose-400" : ""}
                />
                {errors.npi && (
                  <p className="text-[11px] text-rose-500">{errors.npi.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="specialty" className="text-xs font-semibold text-slate-700">
                  Specialty
                </Label>
                <Select
                  value={selectedSpecialty || ""}
                  onValueChange={(val) =>
                    setValue("specialty", val || "", { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="specialty" className="h-10 text-sm bg-white border-slate-200">
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_SPECIALTIES.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="taxId" className="text-xs font-semibold text-slate-700">
                  Tax ID / EIN
                </Label>
                <Input
                  id="taxId"
                  placeholder="XX-XXXXXXX"
                  {...register("taxId")}
                />
              </div>
            </div>
          </div>

          {/* Section: Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  placeholder="(555) 000-0000"
                  {...register("phone")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  Work Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="doctor@clinic.com"
                  {...register("email")}
                  className={errors.email ? "border-rose-400" : ""}
                />
                {errors.email && (
                  <p className="text-[11px] text-rose-500">{errors.email.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section: Practice Address */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Practice Address
            </h4>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="street" className="text-xs font-semibold text-slate-700">
                  Street Address
                </Label>
                <Input
                  id="street"
                  placeholder="Suite 400, 100 Medical Center Dr"
                  {...register("street")}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label htmlFor="city" className="text-xs font-semibold text-slate-700">
                    City
                  </Label>
                  <Input id="city" placeholder="Boston" {...register("city")} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="state" className="text-xs font-semibold text-slate-700">
                    State
                  </Label>
                  <Input id="state" placeholder="MA" {...register("state")} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="zip" className="text-xs font-semibold text-slate-700">
                    ZIP
                  </Label>
                  <Input id="zip" placeholder="02115" {...register("zip")} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="country" className="text-xs font-semibold text-slate-700">
                    Country
                  </Label>
                  <Input id="country" placeholder="USA" {...register("country")} />
                </div>
              </div>
            </div>
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
                  {isEditing ? "Update Provider" : "Register Provider"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
