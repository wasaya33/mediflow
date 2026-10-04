"use client";

import { CheckSquare } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

export default function TasksPage() {
  return (
    <PlaceholderPage
      title="Tasks & Work Queues"
      description="Assign billing tasks, prioritize clearinghouse rejections, manage follow-up deadlines, and track SLAs."
      icon={CheckSquare}
      category="Workflow"
    />
  );
}
