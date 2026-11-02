"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { sincronizarCaracterizacaoPGR } from "@/app/actions/pgr";
import { Button } from "@/components/ui/button";

export function SyncPGRButton({ pgrId }: { pgrId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    await sincronizarCaracterizacaoPGR(pgrId);
    setLoading(false);
    router.refresh();
  }

  return (
    <Button type="button" variant="outline" onClick={handle} disabled={loading}>
      <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Atualizando..." : "Atualizar da empresa"}
    </Button>
  );
}
