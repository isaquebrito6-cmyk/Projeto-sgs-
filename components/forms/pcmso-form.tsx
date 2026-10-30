"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPCMSO, type PCMSOFormData } from "@/app/actions/pcmso";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

type EmpresaOption = { id: string; razaoSocial: string; nomeFantasia: string | null };
type PGROption = { id: string; titulo: string; empresaId: string; empresaNome: string };

export function PCMSOForm({
  empresas,
  pgrs,
  defaultPgrId,
  defaultEmpresaId,
}: {
  empresas: EmpresaOption[];
  pgrs: PGROption[];
  defaultPgrId?: string;
  defaultEmpresaId?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const defaultPgr = pgrs.find((p) => p.id === defaultPgrId);

  const [form, setForm] = useState<PCMSOFormData>({
    titulo: "Programa de Controle Médico de Saúde Ocupacional",
    empresaId: defaultEmpresaId || defaultPgr?.empresaId || empresas[0]?.id || "",
    pgrId: defaultPgrId || "",
    versao: "1.0",
    responsavelNome: "",
    responsavelCrm: "",
    objetivos: "",
    diretrizes: "",
  });

  const pgrsFiltrados = pgrs.filter((p) => p.empresaId === form.empresaId);

  function update(field: keyof PCMSOFormData, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "empresaId") next.pgrId = "";
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await createPCMSO({
        ...form,
        pgrId: form.pgrId || undefined,
      });
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      router.push(`/pcmso/${result.id}`);
      router.refresh();
    } catch {
      setError("Erro ao criar PCMSO.");
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Título *</label>
              <input required value={form.titulo} onChange={(e) => update("titulo", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Empresa *</label>
              <select required value={form.empresaId} onChange={(e) => update("empresaId", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">Selecione</option>
                {empresas.map((e) => (
                  <option key={e.id} value={e.id}>{e.nomeFantasia || e.razaoSocial}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">PGR vinculado (recomendado)</label>
              <select value={form.pgrId} onChange={(e) => update("pgrId", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">Nenhum</option>
                {pgrsFiltrados.map((p) => (
                  <option key={p.id} value={p.id}>{p.titulo}</option>
                ))}
              </select>
              {form.pgrId && (
                <p className="text-xs text-sgs-600">Exames padrão serão criados automaticamente com base nos riscos do PGR.</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Médico responsável (nome)</label>
              <input value={form.responsavelNome} onChange={(e) => update("responsavelNome", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">CRM do responsável</label>
              <input value={form.responsavelCrm} onChange={(e) => update("responsavelCrm", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="bg-sgs-700 hover:bg-sgs-800" disabled={loading}>
              {loading ? "Criando..." : "Criar PCMSO"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>Cancelar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
