"use client";

import { ReceiptText } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

export default function InvoicesPage() {
  return (
    <PlaceholderPage
      title="Invoices & Statements"
      description="Generate patient billing statements, monthly itemized invoices, balance dues, and payment portal links."
      icon={ReceiptText}
      category="Billing"
    />
  );
}
