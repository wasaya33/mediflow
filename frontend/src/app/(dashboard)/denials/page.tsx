"use client";

import { XCircle } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

export default function DenialsPage() {
  return (
    <PlaceholderPage
      title="Denials & Appeals"
      description="Track CARC/RARC denial reason codes, generate appeal letters, and manage timely filing workflows."
      icon={XCircle}
      category="Billing"
    />
  );
}
