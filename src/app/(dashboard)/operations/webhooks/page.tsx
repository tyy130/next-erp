"use client";

import { WebhookManager } from "@/components/features";

export default function WebhooksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Webhooks</h1>
        <p className="text-sm text-muted-foreground mt-1">Subscribe to events and receive HTTP notifications when things change.</p>
      </div>
      <WebhookManager orgId="current" />
    </div>
  );
}
