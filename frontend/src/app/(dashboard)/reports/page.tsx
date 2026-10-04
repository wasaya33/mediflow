"use client";

import { BarChart3 } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

export default function ReportsPage() {
  return (
    <PlaceholderPage
      title="Reports & Financial Analytics"
      description="View Accounts Receivable (A/R) aging buckets, collection ratios, provider productivity, and denial rate trends."
      icon={BarChart3}
      category="Management"
    />
  );
}
