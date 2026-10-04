"use client";

import { DollarSign } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

export default function PaymentsPage() {
  return (
    <PlaceholderPage
      title="Payments & Remittances"
      description="Post ERA/EOB payments (835 transactions), manage patient credit balances, write-offs, and fee schedules."
      icon={DollarSign}
      category="Billing"
    />
  );
}
