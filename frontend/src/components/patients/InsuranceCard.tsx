"use client";

import React from "react";
import { Shield, Calendar, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { InsurancePolicy } from "@/types";

interface InsuranceCardProps {
  policy: InsurancePolicy;
  onEdit: (policy: InsurancePolicy) => void;
  onDeactivate: (policy: InsurancePolicy) => void;
}

export const InsuranceCard: React.FC<InsuranceCardProps> = ({
  policy,
  onEdit,
  onDeactivate,
}) => {
  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "None";
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

  const isExpired = policy.expirationDate
    ? new Date(policy.expirationDate) < new Date()
    : false;

  return (
    <Card className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden transition-all hover:shadow-card">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 border border-teal-200/60 text-teal-700">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base leading-tight">
                {policy.insurerName}
              </h4>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Member ID: <span className="font-semibold text-slate-800">{policy.memberId}</span>
              </p>
            </div>
          </div>

          <StatusBadge
            status={!policy.isActive ? "INACTIVE" : isExpired ? "EXPIRED" : "ACTIVE"}
          />
        </div>

        {/* Policy Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Group #</span>
            <span className="font-medium text-slate-800 font-mono">
              {policy.groupNumber || "—"}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Policy #</span>
            <span className="font-medium text-slate-800 font-mono">
              {policy.policyNumber || "—"}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Relationship</span>
            <span className="font-medium text-slate-800">
              {policy.relationship || "Self"}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Copay / Deductible</span>
            <span className="font-medium text-slate-800">
              ${policy.copay ?? 0} / ${policy.deductible ?? 0}
            </span>
          </div>
        </div>

        {/* Coverage Duration & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>
              {formatDate(policy.effectiveDate)} — {formatDate(policy.expirationDate)}
            </span>
          </div>

          <div className="flex items-center gap-1 self-end sm:self-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(policy)}
              className="h-8 text-xs text-slate-600 hover:text-slate-900"
            >
              <Edit2 className="h-3.5 w-3.5 mr-1 text-slate-400" />
              Edit
            </Button>
            {policy.isActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeactivate(policy)}
                className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Remove
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsuranceCard;
