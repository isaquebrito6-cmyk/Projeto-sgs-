"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSolicitacao, type SolicitacaoFormData } from "@/app/actions/exames";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { TIPOS_EXAME } from "@/types";

type EmpresaOption = { id: string; razaoSocial: string; nomeFantasia: string | null };
type ColabOption = { id: string; nome: string; cpf: string; empresaId: string; funcaoNome: string | null };
type ClinicaOption = { id: string; razaoSocial: string; nomeFantasia: string | null };

export function SolicitacaoForm({
  empresas,
  colaboradores,
  clinicas,
}: {
  empresas: EmpresaOption[];
  colaboradores: ColabOption[];
  clinicas: ClinicaOption[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<SolicitacaoFormData>({
    tipoExame: "Admissional",
    empresaId: empresas[0]?.id || "",
    colaboradorId: "",
    clinicaId: "",
    examesSolicitados: "Exame clínico ocupacional",
    observacoes: "",
  });

  const colabsFiltrados = colaboradores.filter((c) => c.empresaId === form.empresaId);

  function update(field: keyof SolicitacaoFormData, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "empresaId") next.colaboradorId = "";
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await createSolicitacao({
        ...form,
        clinicaId: form.clinicaId || undefined,
      });
      router.push(`/exames/${result.id}`);
      router.refresh();
    } catch {
      setError("Erro ao criar solicitação.");
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de exame (NR-7) *</label>
              <select required value={form.tipoExame} onChange={(e) => update("tipoExame", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {TIPOS_EXAME.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
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
              <label className="text-sm font-medium">Colaborador *</label>
              <select required value={form.colaboradorId} onChange={(e) => update("colaboradorId", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">Selecione o colaborador</option>
                {colabsFiltrados.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}{c.funcaoNome ? ` — ${c.funcaoNome}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Clínica destino</label>
              <select value={form.clinicaId} onChange={(e) => update("clinicaId", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">Selecionar depois</option>
                {clinicas.map((c) => (
                  <option key={c.id} value={c.id}>{c.nomeFantasia || c.razaoSocial}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Exames solicitados</label>
              <input value={form.examesSolicitados} onChange={(e) => update("examesSolicitados", e.target.value)}
                placeholder="Exame clínico, Audiometria, Espirometria..."
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              <p className="text-xs text-slate-400">Os riscos do PGR/PCMSO da empresa serão preenchidos automaticamente quando disponíveis.</p>
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Observações</label>
              <textarea value={form.observacoes} onChange={(e) => update("observacoes", e.target.value)} rows={2}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="bg-sgs-700 hover:bg-sgs-800" disabled={loading}>
              {loading ? "Enviando..." : "Criar solicitação"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
