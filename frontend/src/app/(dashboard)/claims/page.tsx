"use client";

import { Receipt } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

export default function ClaimsPage() {
  return (
    <PlaceholderPage
      title="Claims Management"
      description="Create, scrub, validate, and batch submit ANSI X12 837P/837I claims with automated clearinghouse integration."
      icon={Receipt}
      category="Billing"
    />
  );
}
