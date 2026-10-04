"use client";

import { Shield } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

export default function UsersPage() {
  return (
    <PlaceholderPage
      title="Users & Roles"
      description="Configure role-based access control (RBAC), invite billers and providers, and configure granular permissions."
      icon={Shield}
      category="Admin"
    />
  );
}
