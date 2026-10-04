"use client";

import { Stethoscope } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

export default function ProvidersPage() {
  return (
    <PlaceholderPage
      title="Providers"
      description="Manage practitioner credentials, NPI registries, taxonomy codes, and clearinghouse enrollment."
      icon={Stethoscope}
      category="Clinical"
    />
  );
}
