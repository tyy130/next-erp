"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Database, Loader2 } from "lucide-react";

interface SeedButtonProps {
  existingCount: number;
}

export function SeedDepartmentsButton({ existingCount }: SeedButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleSeed() {
    setLoading(true);
    try {
      const res = await fetch("/api/departments/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(
        `Added ${data.added} departments${data.skipped > 0 ? ` (${data.skipped} already existed)` : ""}`
      );
      window.location.reload();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to seed departments");
    } finally {
      setLoading(false);
    }
  }

  if (existingCount > 0) return null;

  return (
    <Button onClick={handleSeed} disabled={loading} variant="outline" className="gap-2">
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Database className="h-4 w-4" />
      )}
      {loading ? "Adding..." : "Add Default Departments"}
    </Button>
  );
}
