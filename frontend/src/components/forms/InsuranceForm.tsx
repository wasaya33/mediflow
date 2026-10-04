"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, Loader2, Save } from "lucide-react";
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
import { InsurancePolicy, CreateInsuranceRequest } from "@/types";

const insuranceSchema = z.object({
  insurerName: z.string().trim().min(1, "Insurer name is required"),
  memberId: z.string().trim().min(1, "Member ID is required"),
  groupNumber: z.string().trim().optional(),
  policyNumber: z.string().trim().optional(),
  effectiveDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Valid effective date is required",
  }),
  expirationDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Valid expiration date is required",
    }),
  relationship: z.enum(["Self", "Spouse", "Child", "Other"]),
  copay: z.coerce.number().min(0, "Copay must be a positive number").optional(),
  deductible: z.coerce.number().min(0, "Deductible must be a positive number").optional(),
});

type InsuranceFormData = z.infer<typeof insuranceSchema>;

interface InsuranceFormProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  initialData?: InsurancePolicy | null;
  onSubmit: (data: CreateInsuranceRequest) => Promise<unknown>;
  isSubmitting?: boolean;
}

export const InsuranceForm: React.FC<InsuranceFormProps> = ({
  isOpen,
  onClose,
  patientId,
  initialData,
  onSubmit,
  isSubmitting = false,
}) => {
  const isEdit = Boolean(initialData);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<InsuranceFormData>({
    resolver: zodResolver(insuranceSchema),
  });

  const selectedRelationship = watch("relationship");

  useEffect(() => {
    if (initialData) {
      reset({
        insurerName: initialData.insurerName,
        memberId: initialData.memberId,
        groupNumber: initialData.groupNumber || "",
        policyNumber: initialData.policyNumber || "",
        effectiveDate: initialData.effectiveDate
          ? new Date(initialData.effectiveDate).toISOString().split("T")[0]
          : "",
        expirationDate: initialData.expirationDate
          ? new Date(initialData.expirationDate).toISOString().split("T")[0]
          : "",
        relationship: (initialData.relationship as "Self" | "Spouse" | "Child" | "Other") || "Self",
        copay: initialData.copay ?? undefined,
        deductible: initialData.deductible ?? undefined,
      });
    } else {
      reset({
        insurerName: "",
        memberId: "",
        groupNumber: "",
        policyNumber: "",
        effectiveDate: new Date().toISOString().split("T")[0],
        expirationDate: "",
        relationship: "Self",
        copay: undefined,
        deductible: undefined,
      });
    }
  }, [initialData, reset, isOpen]);

  const onFormSubmit = async (data: InsuranceFormData) => {
    await onSubmit({
      ...data,
      patientId,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-6 bg-white rounded-2xl shadow-xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <Shield className="h-4 w-4" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {isEdit ? "Edit Insurance Policy" : "Add Insurance Policy"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            Enter coverage details according to patient insurance ID card
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-2">
          {/* Insurer & Member ID */}
          <div className="space-y-1.5">
            <Label htmlFor="insurerName" className="text-xs font-semibold text-slate-700">
              Payer / Insurance Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="insurerName"
              placeholder="e.g. Blue Cross Blue Shield, Aetna, Medicare"
              {...register("insurerName")}
              className="h-10 text-sm"
            />
            {errors.insurerName && (
              <p className="text-xs text-rose-500">{errors.insurerName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="memberId" className="text-xs font-semibold text-slate-700">
                Member ID <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="memberId"
                placeholder="e.g. XEA1092830"
                {...register("memberId")}
                className="h-10 text-sm font-mono"
              />
              {errors.memberId && (
                <p className="text-xs text-rose-500">{errors.memberId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="groupNumber" className="text-xs font-semibold text-slate-700">
                Group Number
              </Label>
              <Input
                id="groupNumber"
                placeholder="e.g. GRP-4401"
                {...register("groupNumber")}
                className="h-10 text-sm font-mono"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="effectiveDate" className="text-xs font-semibold text-slate-700">
                Effective Date <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="effectiveDate"
                type="date"
                {...register("effectiveDate")}
                className="h-10 text-sm"
              />
              {errors.effectiveDate && (
                <p className="text-xs text-rose-500">{errors.effectiveDate.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expirationDate" className="text-xs font-semibold text-slate-700">
                Expiration Date
              </Label>
              <Input
                id="expirationDate"
                type="date"
                {...register("expirationDate")}
                className="h-10 text-sm"
              />
            </div>
          </div>

          {/* Relationship & Financials */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="relationship" className="text-xs font-semibold text-slate-700">
                Relationship
              </Label>
              <Select
                value={selectedRelationship || "Self"}
                onValueChange={(val) =>
                  setValue(
                    "relationship",
                    (val as "Self" | "Spouse" | "Child" | "Other") || "Self",
                    { shouldValidate: true }
                  )
                }
              >
                <SelectTrigger id="relationship" className="h-10 text-sm bg-white border-slate-200">
                  <SelectValue placeholder="Relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Self">Self</SelectItem>
                  <SelectItem value="Spouse">Spouse</SelectItem>
                  <SelectItem value="Child">Child</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="copay" className="text-xs font-semibold text-slate-700">
                Copay ($)
              </Label>
              <Input
                id="copay"
                type="number"
                step="0.01"
                placeholder="25.00"
                {...register("copay")}
                className="h-10 text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="deductible" className="text-xs font-semibold text-slate-700">
                Deductible ($)
              </Label>
              <Input
                id="deductible"
                type="number"
                step="0.01"
                placeholder="500.00"
                {...register("deductible")}
                className="h-10 text-sm font-mono"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
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
              className="gradient-primary text-white border-0 shadow-sm min-w-[110px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1.5" />
                  {isEdit ? "Update Policy" : "Save Policy"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InsuranceForm;
