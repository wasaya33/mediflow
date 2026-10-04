"use client";

import { Folder } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

export default function DocumentsPage() {
  return (
    <PlaceholderPage
      title="Documents & Attachments"
      description="Store HIPAA-compliant clinical documentation, PWK claim attachments, proof of medical necessity, and ID cards."
      icon={Folder}
      category="Workflow"
    />
  );
}
