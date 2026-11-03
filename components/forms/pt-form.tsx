"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createPT, type PtForm } from "@/app/actions/operacional";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

type EmpresaOption = { id: string; razaoSocial: string; nomeFantasia: string | null };
type ColabOption = { id: string; nome: string; empresaId: string };

export function PtForm({
  empresas,
  colaboradores,
}: {
  empresas: EmpresaOption[];
  colaboradores: ColabOption[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<PtForm>({
    empresaId: empresas[0]?.id || "",
    colaboradorId: "",
    tipo: "PT_GERAL",
    numero: "",
    local: "",
    atividade: "",
    dataInicio: new Date().toISOString().slice(0, 16),
    dataFim: "",
    riscos: "",
    epiNecessario: "",
    medidasControle: "",
    observacoes: "",
    autorizadoPor: "",
    executanteNome: "",
  });

  const colabs = useMemo(
    () => colaboradores.filter((c) => c.empresaId === form.empresaId),
    [colaboradores, form.empresaId]
  );

  function update<K extends keyof PtForm>(field: K, value: PtForm[K]) {
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
      const res = await createPT({
        ...form,
        dataInicio: form.dataInicio.length === 16 ? form.dataInicio + ":00" : form.dataInicio,
        dataFim: form.dataFim
          ? form.dataFim.length === 16
            ? form.dataFim + ":00"
            : form.dataFim
          : undefined,
        colaboradorId: form.colaboradorId || undefined,
      });
      if ("error" in res) {
        setError(res.error);
        setLoading(false);
        return;
      }
      router.push(`/pt/${res.id}`);
      router.refresh();
    } catch {
      setError("Erro ao salvar PT.");
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Empresa *</label>
              <select
                required
                value={form.empresaId}
                onChange={(e) => update("empresaId", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {empresas.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nomeFantasia || e.razaoSocial}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de PT</label>
              <select
                value={form.tipo}
                onChange={(e) => update("tipo", e.target.value as PtForm["tipo"])}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="PT_GERAL">Geral</option>
                <option value="PT_ALTURA">Trabalho em altura</option>
                <option value="PT_QUENTE">Trabalho a quente</option>
                <option value="PT_ELETRICA">Elétrica</option>
                <option value="PT_OUTRA">Outra</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nº da PT</label>
              <input
                value={form.numero}
                onChange={(e) => update("numero", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Opcional"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Colaborador principal (opcional)</label>
              <select
                value={form.colaboradorId}
                onChange={(e) => update("colaboradorId", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">—</option>
                {colabs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Local *</label>
              <input
                required
                value={form.local}
                onChange={(e) => update("local", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Atividade *</label>
              <textarea
                required
                rows={2}
                value={form.atividade}
                onChange={(e) => update("atividade", e.target.value)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Início *</label>
              <input
                type="datetime-local"
                required
                value={form.dataInicio}
                onChange={(e) => update("dataInicio", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fim previsto</label>
              <input
                type="datetime-local"
                value={form.dataFim}
                onChange={(e) => update("dataFim", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Riscos</label>
              <textarea
                rows={2}
                value={form.riscos}
                onChange={(e) => update("riscos", e.target.value)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">EPI necessário</label>
              <input
                value={form.epiNecessario}
                onChange={(e) => update("epiNecessario", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Medidas de controle</label>
              <textarea
                rows={2}
                value={form.medidasControle}
                onChange={(e) => update("medidasControle", e.target.value)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Autorizado por</label>
              <input
                value={form.autorizadoPor}
                onChange={(e) => update("autorizadoPor", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Executante</label>
              <input
                value={form.executanteNome}
                onChange={(e) => update("executanteNome", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Observações</label>
              <textarea
                rows={2}
                value={form.observacoes}
                onChange={(e) => update("observacoes", e.target.value)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="bg-sgs-700 hover:bg-sgs-800" disabled={loading}>
              {loading ? "Salvando..." : "Emitir PT"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/pt")}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
