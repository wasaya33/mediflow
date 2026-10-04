"use client";

import { Users } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

export default function PatientsPage() {
  return (
    <PlaceholderPage
      title="Patients"
      description="Manage patient demographics, insurance policies, guarantor details, and billing ledgers."
      icon={Users}
      category="Clinical"
    />
  );
}
