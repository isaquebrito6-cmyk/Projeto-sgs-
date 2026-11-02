"use client";

import { Button } from "@/components/ui/button";

export function PrintButton({ label = "Imprimir" }: { label?: string }) {
  return (
    <Button
      type="button"
      className="bg-sgs-700 hover:bg-sgs-800"
      onClick={() => window.print()}
    >
      {label}
    </Button>
  );
}
