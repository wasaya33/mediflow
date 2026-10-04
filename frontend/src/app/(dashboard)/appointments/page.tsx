"use client";

import { Calendar } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

export default function AppointmentsPage() {
  return (
    <PlaceholderPage
      title="Appointments"
      description="Schedule clinical appointments, verify real-time insurance eligibility (270/271), and capture copays."
      icon={Calendar}
      category="Clinical"
    />
  );
}
