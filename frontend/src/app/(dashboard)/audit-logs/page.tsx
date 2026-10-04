"use client";

import { ScrollText } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

export default function AuditLogsPage() {
  return (
    <PlaceholderPage
      title="Audit Logs"
      description="Cryptographically sealed HIPAA audit trail recording all PHI views, modifications, claim submissions, and auth attempts."
      icon={ScrollText}
      category="Admin"
    />
  );
}
