"use client";

import { Settings } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

export default function SettingsPage() {
  return (
    <PlaceholderPage
      title="Tenant Settings"
      description="Manage organization profile, Tax ID / EIN, EDI clearinghouse credentials, fee schedules, and billing preferences."
      icon={Settings}
      category="Admin"
    />
  );
}
