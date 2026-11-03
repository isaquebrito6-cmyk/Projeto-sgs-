"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addPPPPeriodo } from "@/app/actions/operacional";
import { Button } from "@/components/ui/button";

export function PppPeriodoForm({ pppId }: { pppId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    dataInicio: "",
    dataFim: "",
    cargoFuncao: "",
    setor: "",
    fatoresRisco: "",
    intensidade: "",
    tecnicaUtilizada: "",
    epcEficaz: false,
    epiEficaz: false,
    observacoes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.dataInicio) {
      setError("Data de início obrigatória.");
      return;
    }
    setLoading(true);
    try {
      const res = await addPPPPeriodo(pppId, {
        ...form,
        dataFim: form.dataFim || undefined,
      });
      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      setOpen(false);
      setForm({
        dataInicio: "",
        dataFim: "",
        cargoFuncao: "",
        setor: "",
        fatoresRisco: "",
        intensidade: "",
        tecnicaUtilizada: "",
        epcEficaz: false,
        epiEficaz: false,
        observacoes: "",
      });
      router.refresh();
    } catch {
      setError("Erro ao adicionar período.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)} className="print:hidden">
        Adicionar período
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border p-4 space-y-3 print:hidden">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium">Início *</label>
          <input
            type="date"
            required
            value={form.dataInicio}
            onChange={(e) => setForm((p) => ({ ...p, dataInicio: e.target.value }))}
            className="flex h-9 w-full rounded-md border px-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Fim</label>
          <input
            type="date"
            value={form.dataFim}
            onChange={(e) => setForm((p) => ({ ...p, dataFim: e.target.value }))}
            className="flex h-9 w-full rounded-md border px-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Cargo / função</label>
          <input
            value={form.cargoFuncao}
            onChange={(e) => setForm((p) => ({ ...p, cargoFuncao: e.target.value }))}
            className="flex h-9 w-full rounded-md border px-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Setor</label>
          <input
            value={form.setor}
            onChange={(e) => setForm((p) => ({ ...p, setor: e.target.value }))}
            className="flex h-9 w-full rounded-md border px-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2 space-y-1">
          <label className="text-xs font-medium">Fatores de risco</label>
          <textarea
            rows={2}
            value={form.fatoresRisco}
            onChange={(e) => setForm((p) => ({ ...p, fatoresRisco: e.target.value }))}
            className="flex w-full rounded-md border px-2 py-1 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Intensidade / concentração</label>
          <input
            value={form.intensidade}
            onChange={(e) => setForm((p) => ({ ...p, intensidade: e.target.value }))}
            className="flex h-9 w-full rounded-md border px-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Técnica utilizada</label>
          <input
            value={form.tecnicaUtilizada}
            onChange={(e) => setForm((p) => ({ ...p, tecnicaUtilizada: e.target.value }))}
            className="flex h-9 w-full rounded-md border px-2 text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.epcEficaz}
            onChange={(e) => setForm((p) => ({ ...p, epcEficaz: e.target.checked }))}
          />
          EPC eficaz
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.epiEficaz}
            onChange={(e) => setForm((p) => ({ ...p, epiEficaz: e.target.checked }))}
          />
          EPI eficaz
        </label>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="bg-sgs-700 hover:bg-sgs-800" disabled={loading}>
          {loading ? "Salvando..." : "Salvar período"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
