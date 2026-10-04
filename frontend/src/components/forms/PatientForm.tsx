"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User,
  Phone,
  MapPin,
  HeartHandshake,
  FileText,
  Loader2,
  Save,
  ArrowLeft,
} from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Patient, CreatePatientRequest } from "@/types";

const patientFormSchema = z.object({
  patientId: z.string().trim().min(1, "Patient ID (MRN) is required"),
  firstName: z.string().trim().min(2, "First name must be at least 2 characters"),
  lastName: z.string().trim().min(2, "Last name must be at least 2 characters"),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Valid Date of Birth is required",
  }),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  phone: z.string().trim().min(7, "Phone number must be at least 7 characters"),
  email: z
    .string()
    .trim()
    .email("Invalid email address format")
    .optional()
    .or(z.literal("")),
  address: z
    .object({
      street: z.string().trim().optional(),
      city: z.string().trim().optional(),
      state: z.string().trim().optional(),
      zip: z.string().trim().optional(),
      country: z.string().trim().optional(),
    })
    .optional(),
  emergencyContact: z
    .object({
      name: z.string().trim().optional(),
      phone: z.string().trim().optional(),
      relationship: z.string().trim().optional(),
    })
    .optional(),
  notes: z.string().trim().optional(),
});

type PatientFormData = z.infer<typeof patientFormSchema>;

interface PatientFormProps {
  initialData?: Patient;
  onSubmit: (data: CreatePatientRequest) => Promise<unknown>;
  isSubmitting?: boolean;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting = false,
}) => {
  const router = useRouter();
  const isEditMode = Boolean(initialData);

  // Format initial ISO date into yyyy-MM-dd for HTML date input
  const defaultDob = initialData?.dob
    ? new Date(initialData.dob).toISOString().split("T")[0]
    : "";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      patientId: initialData?.patientId || "",
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      dob: defaultDob,
      gender: (initialData?.gender as "Male" | "Female" | "Other") || undefined,
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      address: {
        street: initialData?.address?.street || "",
        city: initialData?.address?.city || "",
        state: initialData?.address?.state || "",
        zip: initialData?.address?.zip || "",
        country: initialData?.address?.country || "USA",
      },
      emergencyContact: {
        name: initialData?.emergencyContact?.name || "",
        phone: initialData?.emergencyContact?.phone || "",
        relationship: initialData?.emergencyContact?.relationship || "",
      },
      notes: initialData?.notes || "",
    },
  });

  const selectedGender = watch("gender");

  const onFormSubmit = async (data: PatientFormData) => {
    try {
      await onSubmit(data as CreatePatientRequest);
      toast.success(
        isEditMode
          ? "Patient record updated successfully"
          : "Patient registered successfully"
      );
      router.push("/patients");
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to save patient record";
      toast.error(errorMsg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Personal Information */}
        <Card className="rounded-xl border border-slate-200/90 bg-white shadow-subtle">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-600" />
              <CardTitle className="text-base font-bold text-slate-900">
                Personal Demographics
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Primary identification and vital records
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {/* Patient ID (MRN) */}
            <div className="space-y-1.5">
              <Label htmlFor="patientId" className="text-xs font-semibold text-slate-700">
                Medical Record Number (MRN) <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="patientId"
                placeholder="e.g. MRN-8921"
                {...register("patientId")}
                className="h-10 text-sm font-mono"
              />
              {errors.patientId && (
                <p className="text-xs text-rose-500">{errors.patientId.message}</p>
              )}
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-semibold text-slate-700">
                  First Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="First name"
                  {...register("firstName")}
                  className="h-10 text-sm"
                />
                {errors.firstName && (
                  <p className="text-xs text-rose-500">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-semibold text-slate-700">
                  Last Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="Last name"
                  {...register("lastName")}
                  className="h-10 text-sm"
                />
                {errors.lastName && (
                  <p className="text-xs text-rose-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* DOB & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dob" className="text-xs font-semibold text-slate-700">
                  Date of Birth <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="dob"
                  type="date"
                  {...register("dob")}
                  className="h-10 text-sm"
                />
                {errors.dob && (
                  <p className="text-xs text-rose-500">{errors.dob.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gender" className="text-xs font-semibold text-slate-700">
                  Gender
                </Label>
                <Select
                  value={selectedGender || ""}
                  onValueChange={(val) =>
                    setValue("gender", (val as "Male" | "Female" | "Other") || undefined, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger id="gender" className="h-10 text-sm bg-white border-slate-200">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Contact Information */}
        <Card className="rounded-xl border border-slate-200/90 bg-white shadow-subtle">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-teal-600" />
              <CardTitle className="text-base font-bold text-slate-900">
                Contact Details
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Direct patient communication lines
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                Phone Number <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="phone"
                placeholder="(555) 000-0000"
                {...register("phone")}
                className="h-10 text-sm font-mono"
              />
              {errors.phone && (
                <p className="text-xs text-rose-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="patient@example.com"
                {...register("email")}
                className="h-10 text-sm"
              />
              {errors.email && (
                <p className="text-xs text-rose-500">{errors.email.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Residential Address */}
        <Card className="rounded-xl border border-slate-200/90 bg-white shadow-subtle">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-indigo-600" />
              <CardTitle className="text-base font-bold text-slate-900">
                Mailing & Billing Address
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Physical guarantor residence
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="street" className="text-xs font-semibold text-slate-700">
                Street Address
              </Label>
              <Input
                id="street"
                placeholder="123 Healthcare Blvd, Suite 400"
                {...register("address.street")}
                className="h-10 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs font-semibold text-slate-700">
                  City
                </Label>
                <Input
                  id="city"
                  placeholder="City"
                  {...register("address.city")}
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="state" className="text-xs font-semibold text-slate-700">
                  State
                </Label>
                <Input
                  id="state"
                  placeholder="CA, NY, etc."
                  {...register("address.state")}
                  className="h-10 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="zip" className="text-xs font-semibold text-slate-700">
                  ZIP / Postal Code
                </Label>
                <Input
                  id="zip"
                  placeholder="90210"
                  {...register("address.zip")}
                  className="h-10 text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="country" className="text-xs font-semibold text-slate-700">
                  Country
                </Label>
                <Input
                  id="country"
                  placeholder="USA"
                  {...register("address.country")}
                  className="h-10 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Emergency Contact */}
        <Card className="rounded-xl border border-slate-200/90 bg-white shadow-subtle">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <HeartHandshake className="h-4 w-4 text-rose-600" />
              <CardTitle className="text-base font-bold text-slate-900">
                Emergency Contact
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Next of kin or designated representative
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="emName" className="text-xs font-semibold text-slate-700">
                Contact Name
              </Label>
              <Input
                id="emName"
                placeholder="Full name"
                {...register("emergencyContact.name")}
                className="h-10 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="emPhone" className="text-xs font-semibold text-slate-700">
                  Phone Number
                </Label>
                <Input
                  id="emPhone"
                  placeholder="(555) 123-4567"
                  {...register("emergencyContact.phone")}
                  className="h-10 text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="emRel" className="text-xs font-semibold text-slate-700">
                  Relationship
                </Label>
                <Input
                  id="emRel"
                  placeholder="Spouse, Parent, etc."
                  {...register("emergencyContact.relationship")}
                  className="h-10 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 5: Clinical Notes (Full width) */}
      <Card className="rounded-xl border border-slate-200/90 bg-white shadow-subtle">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-600" />
            <CardTitle className="text-base font-bold text-slate-900">
              Internal Billing & Clinical Notes
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Special handling instructions, copay arrangements, or eligibility reminders
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <Textarea
            id="notes"
            placeholder="Add internal notes or alerts..."
            rows={3}
            {...register("notes")}
            className="text-sm border-slate-200"
          />
        </CardContent>
      </Card>

      {/* Bottom Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/patients")}
          disabled={isSubmitting}
          className="border-slate-200 text-slate-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="gradient-primary text-white border-0 shadow-md min-w-[140px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1.5" />
              {isEditMode ? "Update Patient" : "Save Patient"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default PatientForm;
