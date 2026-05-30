"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { toast } from "sonner";

export function DeleteButton({ action }: { action: () => Promise<void> }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={pending}
      onClick={() => {
        if (!confirm("Are you sure?")) return;
        startTransition(async () => {
          try {
            await action();
            toast.success("Deleted");
          } catch {
            toast.error("Failed to delete");
          }
        });
      }}
    >
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  );
}
