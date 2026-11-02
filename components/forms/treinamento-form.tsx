"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createTreinamento, type TreinamentoFormData } from "@/app/actions/treinamentos";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

type EmpresaOption = { id: string; razaoSocial: string; nomeFantasia: string | null };
type ColabOption = {
  id: string;
  nome: string;
  empresaId: string;
  empresa?: { nomeFantasia: string | null; razaoSocial: string };
};

const TIPOS = [
  "DDS",
  "NR-06",
  "NR-10",
  "NR-12",
  "NR-18",
  "NR-35",
  "Integração",
  "CIPA",
  "Brigada",
  "Outro",
];

export function TreinamentoForm({
  empresas,
  colaboradores,
}: {
  empresas: EmpresaOption[];
  colaboradores: ColabOption[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<TreinamentoFormData>({
    titulo: "",
    tipo: "DDS",
    empresaId: empresas[0]?.id || "",
    cargaHoraria: "",
    dataRealizacao: "",
    validade: "",
    instrutor: "",
    local: "",
    conteudo: "",
    observacoes: "",
    colaboradorIds: [],
  });

  const colabsEmpresa = useMemo(
    () => colaboradores.filter((c) => c.empresaId === form.empresaId),
    [colaboradores, form.empresaId]
  );

  function update(field: keyof TreinamentoFormData, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "empresaId") next.colaboradorIds = [];
      return next;
    });
  }

  function toggleColab(id: string) {
    setForm((prev) => {
      const set = new Set(prev.colaboradorIds || []);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return { ...prev, colaboradorIds: Array.from(set) };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await createTreinamento(form);
      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      router.push(`/treinamentos/${res.id}`);
      router.refresh();
    } catch {
      setError("Erro ao salvar.");
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
              <label className="text-sm font-medium">Título *</label>
              <input
                required
                value={form.titulo}
                onChange={(e) => update("titulo", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => update("tipo", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
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
              <label className="text-sm font-medium">Data</label>
              <input
                type="date"
                value={form.dataRealizacao}
                onChange={(e) => update("dataRealizacao", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Validade</label>
              <input
                type="date"
                value={form.validade}
                onChange={(e) => update("validade", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Carga horária (h)</label>
              <input
                type="number"
                min={0}
                value={form.cargaHoraria}
                onChange={(e) => update("cargaHoraria", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Instrutor</label>
              <input
                value={form.instrutor}
                onChange={(e) => update("instrutor", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Local</label>
              <input
                value={form.local}
                onChange={(e) => update("local", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Conteúdo / pauta</label>
              <textarea
                value={form.conteudo}
                onChange={(e) => update("conteudo", e.target.value)}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Participantes ({form.colaboradorIds?.length || 0})
            </label>
            {colabsEmpresa.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum colaborador nesta empresa.</p>
            ) : (
              <div className="max-h-48 overflow-auto rounded-md border p-2 space-y-1">
                {colabsEmpresa.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.colaboradorIds?.includes(c.id) || false}
                      onChange={() => toggleColab(c.id)}
                    />
                    {c.nome}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="bg-sgs-700 hover:bg-sgs-800" disabled={loading}>
              {loading ? "Salvando..." : "Salvar treinamento"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
