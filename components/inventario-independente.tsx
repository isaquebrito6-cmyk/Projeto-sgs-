"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import {
  addRiscoInventarioEmpresa,
  removeRiscoInventarioEmpresa,
} from "@/app/actions/inventario";
import type { InventarioItemData } from "@/app/actions/pgr";
import { RISCOS_SUGERIDOS } from "@/lib/riscos-sugeridos";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TIPO_RISCO_LABELS, NIVEL_RISCO_LABELS } from "@/types";
import type { TipoRisco, NivelRisco } from "@prisma/client";

type FuncaoOpt = { id: string; nome: string };
type GheOpt = { id: string; nome: string };
type SetorOpt = {
  id: string;
  nome: string;
  funcoes: FuncaoOpt[];
  ghes?: GheOpt[];
  _count?: { colaboradores: number };
};

type Item = {
  id: string;
  setorNome: string | null;
  funcaoNome: string | null;
  gheNome?: string | null;
  fonteGeradora: string | null;
  numeroExpostos: number | null;
  probabilidade: number | null;
  severidade: number | null;
  nivelRisco: NivelRisco | null;
  medidasExistentes: string | null;
  risco: { id: string; nome: string; tipo: TipoRisco };
};

const nivelColor: Record<string, string> = {
  BAIXO: "bg-emerald-100 text-emerald-700",
  MEDIO: "bg-amber-100 text-amber-700",
  ALTO: "bg-orange-100 text-orange-700",
  MUITO_ALTO: "bg-red-100 text-red-700",
};

const emptyForm: InventarioItemData = {
  riscoNome: "",
  tipoRisco: "FISICO",
  setorNome: "",
  funcaoNome: "",
  gheNome: "",
  fonteGeradora: "",
  numeroExpostos: undefined,
  probabilidade: 3,
  severidade: 3,
  medidasExistentes: "",
};

export function InventarioIndependente({
  empresaId,
  pgrId,
  itens,
  setores = [],
}: {
  empresaId: string;
  pgrId: string;
  itens: Item[];
  setores?: SetorOpt[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(itens.length === 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<InventarioItemData>(emptyForm);

  const setorAtual = useMemo(
    () => setores.find((s) => s.nome === form.setorNome),
    [form.setorNome, setores]
  );
  const funcoesDoSetor = setorAtual?.funcoes || [];
  const ghesDoSetor = setorAtual?.ghes || [];

  function aplicarSugestao(nome: string) {
    const s = RISCOS_SUGERIDOS.find((r) => r.nome === nome);
    if (!s) {
      setForm((prev) => ({ ...prev, riscoNome: nome }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      riscoNome: s.nome,
      tipoRisco: s.tipo,
      fonteGeradora: s.fonteGeradora || prev.fonteGeradora,
    }));
  }

  function onSetorChange(nome: string) {
    const s = setores.find((x) => x.nome === nome);
    setForm((prev) => ({
      ...prev,
      setorNome: nome,
      funcaoNome: "",
      gheNome: "",
      numeroExpostos: s?._count?.colaboradores ?? prev.numeroExpostos,
    }));
  }

  async function handleAdd() {
    if (!form.riscoNome.trim()) {
      setError("Informe o nome do risco.");
      return;
    }
    setError("");
    setLoading(true);
    const res = await addRiscoInventarioEmpresa(empresaId, form);
    setLoading(false);
    if ("error" in res) {
      setError(res.error || "Erro ao salvar");
      return;
    }
    setForm(emptyForm);
    setShowForm(false);
    router.refresh();
  }

  async function handleRemove(id: string) {
    if (!confirm("Remover este risco do inventário?")) return;
    setLoading(true);
    await removeRiscoInventarioEmpresa(id, empresaId);
    setLoading(false);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Riscos ocupacionais
          <span className="text-sm font-normal text-slate-400">({itens.length})</span>
        </CardTitle>
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)} disabled={loading}>
          <Plus className="w-4 h-4" />
          Adicionar risco
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-slate-500">
          Conteúdo mínimo NR-1 (1.5.7.3.2). Os itens ficam gravados no PGR{" "}
          <code className="text-[10px] bg-slate-100 px-1 rounded">{pgrId.slice(0, 8)}…</code> e passam a
          alimentar PCMSO e exames.
        </p>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {showForm && (
          <div className="p-4 rounded-lg bg-slate-50 border space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-medium text-slate-600">Risco sugerido</label>
                <select
                  defaultValue=""
                  onChange={(e) => e.target.value && aplicarSugestao(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Escolher risco comum...</option>
                  {RISCOS_SUGERIDOS.map((r) => (
                    <option key={r.nome} value={r.nome}>
                      {TIPO_RISCO_LABELS[r.tipo]} — {r.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Nome do risco *</label>
                <input
                  autoFocus
                  value={form.riscoNome}
                  onChange={(e) => setForm({ ...form, riscoNome: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Tipo</label>
                <select
                  value={form.tipoRisco}
                  onChange={(e) => setForm({ ...form, tipoRisco: e.target.value as TipoRisco })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {Object.entries(TIPO_RISCO_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Setor</label>
                {setores.length > 0 ? (
                  <select
                    value={form.setorNome || ""}
                    onChange={(e) => onSetorChange(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Selecione</option>
                    {setores.map((s) => (
                      <option key={s.id} value={s.nome}>
                        {s.nome}
                        {s._count ? ` (${s._count.colaboradores})` : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={form.setorNome}
                    onChange={(e) => setForm({ ...form, setorNome: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  />
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Função</label>
                <select
                  value={form.funcaoNome || ""}
                  onChange={(e) => setForm({ ...form, funcaoNome: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Selecione</option>
                  {funcoesDoSetor.map((f) => (
                    <option key={f.id} value={f.nome}>
                      {f.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">GHE</label>
                <select
                  value={form.gheNome || ""}
                  onChange={(e) => setForm({ ...form, gheNome: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Selecione</option>
                  {ghesDoSetor.map((g) => (
                    <option key={g.id} value={g.nome}>
                      {g.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Fonte geradora</label>
                <input
                  value={form.fonteGeradora}
                  onChange={(e) => setForm({ ...form, fonteGeradora: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Nº de expostos</label>
                <input
                  type="number"
                  min={0}
                  value={form.numeroExpostos ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      numeroExpostos: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Probabilidade (1–5)</label>
                <select
                  value={form.probabilidade ?? 3}
                  onChange={(e) => setForm({ ...form, probabilidade: Number(e.target.value) })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Severidade (1–5)</label>
                <select
                  value={form.severidade ?? 3}
                  onChange={(e) => setForm({ ...form, severidade: Number(e.target.value) })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-medium text-slate-600">Medidas existentes</label>
                <input
                  value={form.medidasExistentes}
                  onChange={(e) => setForm({ ...form, medidasExistentes: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={loading}
                className="bg-sgs-700 hover:bg-sgs-800"
              >
                {loading ? "Salvando..." : "Salvar no inventário (alimenta o sistema)"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {itens.length === 0 && !showForm && (
          <p className="text-sm text-slate-500 text-center py-6">
            Nenhum risco ainda. Clique em <strong>Adicionar risco</strong>.
          </p>
        )}

        {itens.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">{item.risco.nome}</span>
                <span className="text-xs text-slate-400">{TIPO_RISCO_LABELS[item.risco.tipo]}</span>
                {item.nivelRisco && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      nivelColor[item.nivelRisco]
                    }`}
                  >
                    {NIVEL_RISCO_LABELS[item.nivelRisco]}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {[item.setorNome, item.funcaoNome, item.gheNome ? `GHE: ${item.gheNome}` : null]
                  .filter(Boolean)
                  .join(" · ")}
                {item.numeroExpostos != null && ` · ${item.numeroExpostos} exposto(s)`}
                {item.probabilidade &&
                  item.severidade &&
                  ` · P${item.probabilidade}×S${item.severidade}`}
              </p>
            </div>
            <button
              onClick={() => handleRemove(item.id)}
              className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 shrink-0"
              type="button"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
