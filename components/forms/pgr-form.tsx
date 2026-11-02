"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createPGR,
  getEmpresaEstruturaParaPGR,
  type PGRFormData,
} from "@/app/actions/pgr";
import { labelGrauRisco } from "@/lib/pgr-nr1";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Building2 } from "lucide-react";

type EmpresaOption = {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  grauRisco?: number | null;
  cnae?: string | null;
};

type Preview = Awaited<ReturnType<typeof getEmpresaEstruturaParaPGR>>;

export function PGRForm({ empresas }: { empresas: EmpresaOption[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<Preview>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

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

  useEffect(() => {
    if (!form.empresaId) {
      setPreview(null);
      return;
    }
    let cancelled = false;
    setLoadingPreview(true);
    getEmpresaEstruturaParaPGR(form.empresaId)
      .then((data) => {
        if (!cancelled) setPreview(data);
      })
      .finally(() => {
        if (!cancelled) setLoadingPreview(false);
      });
    return () => {
      cancelled = true;
    };
  }, [form.empresaId]);

  function update(field: keyof PGRFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await createPGR(form);
      if ("error" in result && result.error) {
        setError(String(result.error));
        setLoading(false);
        return;
      }
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

          <p className="text-sm text-slate-600">
            Ao criar o PGR, o sistema <strong>puxa automaticamente</strong> da empresa: razão social,
            CNPJ, CNAE, <strong>grau de risco (NR-4)</strong>, setores, funções e{" "}
            <strong>GHE</strong>, e monta a caracterização dos processos conforme NR-1.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Empresa *</label>
              <select
                required
                value={form.empresaId}
                onChange={(e) => update("empresaId", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Selecione</option>
                {empresas.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nomeFantasia || e.razaoSocial}
                    {e.grauRisco != null ? ` · GR ${e.grauRisco}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {form.empresaId && (
              <div className="sm:col-span-2 rounded-lg border border-sgs-100 bg-sgs-50/80 p-4 text-sm space-y-2">
                <p className="font-medium text-sgs-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Dados que serão incorporados ao PGR
                </p>
                {loadingPreview && <p className="text-slate-500 text-xs">Carregando estrutura...</p>}
                {preview && !loadingPreview && (
                  <ul className="text-xs text-slate-700 space-y-1">
                    <li>
                      <strong>Grau de risco (NR-4):</strong> {labelGrauRisco(preview.grauRisco)}
                    </li>
                    {preview.cnae && (
                      <li>
                        <strong>CNAE:</strong> {preview.cnae}
                      </li>
                    )}
                    {preview.numeroFuncionarios != null && (
                      <li>
                        <strong>Trabalhadores:</strong> {preview.numeroFuncionarios}
                      </li>
                    )}
                    <li>
                      <strong>Setores:</strong>{" "}
                      {preview.setores.length
                        ? preview.setores
                            .map(
                              (s) =>
                                `${s.nome} (${s.nColaboradores} colab.; ${s.funcoes.length} funções; ${s.ghes.length} GHE)`
                            )
                            .join(" · ")
                        : "nenhum cadastrado — cadastre setores/funções/GHE na empresa"}
                    </li>
                  </ul>
                )}
              </div>
            )}

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Título</label>
              <input
                value={form.titulo}
                onChange={(e) => update("titulo", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Versão</label>
              <input
                value={form.versao}
                onChange={(e) => update("versao", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Elaborador (nome)</label>
              <input
                value={form.elaboradorNome}
                onChange={(e) => update("elaboradorNome", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Registro profissional (CREA etc.)</label>
              <input
                value={form.elaboradorRegistro}
                onChange={(e) => update("elaboradorRegistro", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">
                Caracterização dos processos (opcional — se vazio, gera pela empresa)
              </label>
              <textarea
                value={form.caracterizacaoProcessos}
                onChange={(e) => update("caracterizacaoProcessos", e.target.value)}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Deixe em branco para montar automaticamente com setores, funções, GHE e grau de risco..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="bg-sgs-700 hover:bg-sgs-800" disabled={loading}>
              {loading ? "Criando..." : "Criar PGR e abrir inventário"}
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
