"use client";

import { FileText } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

export default function EncountersPage() {
  return (
    <PlaceholderPage
      title="Encounters"
      description="Review clinical SOAP notes, ICD-10 diagnosis tagging, CPT charge captures, and superbill conversion."
      icon={FileText}
      category="Clinical"
    />
  );
}
