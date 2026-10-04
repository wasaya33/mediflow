"use client";

import { Bell } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

export default function NotificationsPage() {
  return (
    <PlaceholderPage
      title="Notifications & System Alerts"
      description="Manage automated clearinghouse responses, timely filing warnings, electronic remittance alerts, and batch digests."
      icon={Bell}
      category="Management"
    />
  );
}
