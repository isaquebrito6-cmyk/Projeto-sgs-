"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPGR, type PGRFormData } from "@/app/actions/pgr";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

type EmpresaOption = { id: string; razaoSocial: string; nomeFantasia: string | null };

export function PGRForm({ empresas }: { empresas: EmpresaOption[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<PGRFormData>({
    titulo: "Programa de Gerenciamento de Riscos",
    empresaId: empresas[0]?.id || "",
    versao: "1.0",
    elaboradorNome: "",
    elaboradorRegistro: "",
    caracterizacaoProcessos: "",
    metodologiaAvaliacao: "",
    observacoes: "",
  });

  function update(field: keyof PGRFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await createPGR(form);
      router.push(`/pgr/${result.id}`);
      router.refresh();
    } catch {
      setError("Erro ao criar PGR.");
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
                  <option key={e.id} value={e.id}>
                    {e.nomeFantasia || e.razaoSocial}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Versão</label>
              <input value={form.versao} onChange={(e) => update("versao", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Elaborador (nome)</label>
              <input value={form.elaboradorNome} onChange={(e) => update("elaboradorNome", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Registro profissional (CREA etc.)</label>
              <input value={form.elaboradorRegistro} onChange={(e) => update("elaboradorRegistro", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Caracterização dos processos e ambientes</label>
              <textarea value={form.caracterizacaoProcessos} onChange={(e) => update("caracterizacaoProcessos", e.target.value)} rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Descreva os processos produtivos, ambientes de trabalho e atividades principais..." />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Metodologia de avaliação</label>
              <textarea value={form.metodologiaAvaliacao} onChange={(e) => update("metodologiaAvaliacao", e.target.value)} rows={2}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Critérios de probabilidade e severidade, normas de referência..." />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="bg-sgs-700 hover:bg-sgs-800" disabled={loading}>
              {loading ? "Criando..." : "Criar PGR e adicionar riscos"}
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
