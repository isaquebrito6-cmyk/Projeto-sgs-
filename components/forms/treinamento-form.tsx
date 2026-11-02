"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createTreinamento, type TreinamentoFormData } from "@/app/actions/treinamentos";
import {
  CATALOGO_TREINAMENTOS,
  calcularValidade,
  formatValidadeLabel,
  getCatalogoById,
} from "@/lib/nr-treinamentos";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ExternalLink } from "lucide-react";

type EmpresaOption = {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  pastaTreinamentosUrl?: string | null;
};
type ColabOption = {
  id: string;
  nome: string;
  empresaId: string;
};

function initialFromCatalogo(catalogoInicial?: string) {
  const base =
    (catalogoInicial && getCatalogoById(catalogoInicial)) ||
    CATALOGO_TREINAMENTOS[0] ||
    null;
  return base;
}

export function TreinamentoForm({
  empresas,
  colaboradores,
  catalogoInicial,
}: {
  empresas: EmpresaOption[];
  colaboradores: ColabOption[];
  catalogoInicial?: string;
}) {
  const router = useRouter();
  const initial = initialFromCatalogo(catalogoInicial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [catalogoId, setCatalogoId] = useState(initial?.id || "dds");

  const [form, setForm] = useState<TreinamentoFormData>({
    titulo: initial?.titulo || "",
    tipo: initial?.norma || "DDS",
    empresaId: empresas[0]?.id || "",
    catalogoId: initial?.id || "",
    cargaHoraria: initial?.cargaHorariaMin?.toString() || "",
    dataRealizacao: "",
    validade: "",
    instrutor: "",
    local: "",
    conteudo: initial?.conteudoProgramatico || "",
    observacoes: initial?.observacao || "",
    materialUrl: "",
    colaboradorIds: [],
  });

  const cat = getCatalogoById(catalogoId);
  const empresaAtual = empresas.find((e) => e.id === form.empresaId);

  const colabsEmpresa = useMemo(
    () => colaboradores.filter((c) => c.empresaId === form.empresaId),
    [colaboradores, form.empresaId]
  );

  // Agrupa opções do select por norma para ficar legível
  const opcoesPorNorma = useMemo(() => {
    const map = new Map<string, typeof CATALOGO_TREINAMENTOS>();
    for (const c of CATALOGO_TREINAMENTOS) {
      if (!map.has(c.norma)) map.set(c.norma, []);
      map.get(c.norma)!.push(c);
    }
    return Array.from(map.entries());
  }, []);

  function applyCatalogo(id: string) {
    const c = getCatalogoById(id);
    if (!c) return;
    setCatalogoId(id);
    setForm((prev) => {
      let validade = prev.validade;
      if (prev.dataRealizacao && c.validadeMeses) {
        const v = calcularValidade(new Date(prev.dataRealizacao), c.validadeMeses);
        if (v) validade = v.toISOString().slice(0, 10);
      } else if (!c.validadeMeses) {
        validade = "";
      }
      return {
        ...prev,
        catalogoId: id,
        titulo: c.titulo,
        tipo: c.norma,
        cargaHoraria: c.cargaHorariaMin != null ? String(c.cargaHorariaMin) : prev.cargaHoraria,
        conteudo: c.conteudoProgramatico,
        observacoes: c.observacao || "",
        validade,
      };
    });
  }

  function update(field: keyof TreinamentoFormData, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "empresaId") next.colaboradorIds = [];
      if (field === "dataRealizacao" && value && cat?.validadeMeses) {
        const v = calcularValidade(new Date(value), cat.validadeMeses);
        if (v) next.validade = v.toISOString().slice(0, 10);
      }
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

  function selectAll() {
    setForm((prev) => ({
      ...prev,
      colaboradorIds: colabsEmpresa.map((c) => c.id),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await createTreinamento({ ...form, catalogoId });
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Modelo conforme NR (MTE) *</label>
            <select
              value={catalogoId}
              onChange={(e) => applyCatalogo(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {opcoesPorNorma.map(([norma, itens]) => (
                <optgroup key={norma} label={norma}>
                  {itens.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.titulo}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {cat && (
              <div className="rounded-md border border-sgs-100 bg-sgs-50/80 px-3 py-2 text-xs text-sgs-900 space-y-1">
                <p>
                  <strong>Carga mín. sugerida:</strong>{" "}
                  {cat.cargaHorariaMin != null ? `${cat.cargaHorariaMin} h` : "definida pelo empregador"}
                  {" · "}
                  <strong>Periodicidade:</strong> {formatValidadeLabel(cat.validadeMeses)}
                  {" · "}
                  <strong>Modalidade:</strong> {cat.modalidade.replace(/_/g, " ")}
                </p>
                {cat.observacao && <p className="text-slate-600">{cat.observacao}</p>}
              </div>
            )}
          </div>

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
              <label className="text-sm font-medium">Norma / tipo</label>
              <input
                value={form.tipo}
                onChange={(e) => update("tipo", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
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
              <label className="text-sm font-medium">Data de realização</label>
              <input
                type="date"
                value={form.dataRealizacao}
                onChange={(e) => update("dataRealizacao", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Validade (próximo periódico)</label>
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
              <label className="text-sm font-medium">Instrutor / responsável técnico</label>
              <input
                value={form.instrutor}
                onChange={(e) => update("instrutor", e.target.value)}
                placeholder="Nome e qualificação (NR-1)"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Local de realização</label>
              <input
                value={form.local}
                onChange={(e) => update("local", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Link do material (opcional)</label>
              <input
                value={form.materialUrl || ""}
                onChange={(e) => update("materialUrl", e.target.value)}
                placeholder="https://drive.google.com/... (PDF ou pasta)"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <p className="text-xs text-slate-500">
                Se vazio, usa o material cadastrado em Materiais / pasta para este tipo de NR.{" "}
                {empresaAtual?.pastaTreinamentosUrl && (
                  <a
                    href={empresaAtual.pastaTreinamentosUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sgs-700 underline inline-flex items-center gap-0.5"
                  >
                    Abrir pasta da empresa <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </p>
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Conteúdo programático (NR-1)</label>
              <textarea
                value={form.conteudo}
                onChange={(e) => update("conteudo", e.target.value)}
                rows={5}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Observações</label>
              <textarea
                value={form.observacoes}
                onChange={(e) => update("observacoes", e.target.value)}
                rows={2}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium">
                Participantes ({form.colaboradorIds?.length || 0})
              </label>
              {colabsEmpresa.length > 0 && (
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs text-sgs-700 font-medium hover:underline"
                >
                  Selecionar todos da empresa
                </button>
              )}
            </div>
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
