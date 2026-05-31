"use client";

import { TimeTracker, DarkModeToggle } from "@/components/features";

export default function TimePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Time Tracking</h1>
          <p className="text-sm text-muted-foreground mt-1">Log hours, track billable time, and manage timesheets.</p>
        </div>
      </div>
      <TimeTracker orgId="current" />
    </div>
  );
}
