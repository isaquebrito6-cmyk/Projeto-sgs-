"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { addInventarioItem, removeInventarioItem, type InventarioItemData } from "@/app/actions/pgr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TIPO_RISCO_LABELS, NIVEL_RISCO_LABELS } from "@/types";
import type { TipoRisco, NivelRisco } from "@prisma/client";

type Item = {
  id: string;
  setorNome: string | null;
  funcaoNome: string | null;
  fonteGeradora: string | null;
  numeroExpostos: number | null;
  tipoExposicao: string | null;
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
  fonteGeradora: "",
  numeroExpostos: undefined,
  tipoExposicao: "",
  probabilidade: 3,
  severidade: 3,
  medidasExistentes: "",
};

export function PGRInventario({ pgrId, itens }: { pgrId: string; itens: Item[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<InventarioItemData>(emptyForm);

  async function handleAdd() {
    if (!form.riscoNome.trim()) return;
    setLoading(true);
    await addInventarioItem(pgrId, form);
    setForm(emptyForm);
    setShowForm(false);
    setLoading(false);
    router.refresh();
  }

  async function handleRemove(id: string) {
    if (!confirm("Remover este risco do inventário?")) return;
    setLoading(true);
    await removeInventarioItem(id, pgrId);
    setLoading(false);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Inventário de Riscos Ocupacionais
          <span className="text-sm font-normal text-slate-400">({itens.length})</span>
        </CardTitle>
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)} disabled={loading}>
          <Plus className="w-4 h-4" />
          Adicionar risco
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <div className="p-4 rounded-lg bg-slate-50 border space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Nome do risco / perigo *</label>
                <input
                  autoFocus
                  value={form.riscoNome}
                  onChange={(e) => setForm({ ...form, riscoNome: e.target.value })}
                  placeholder="Ex: Ruído, Poeira, Postura inadequada..."
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Tipo de risco</label>
                <select
                  value={form.tipoRisco}
                  onChange={(e) => setForm({ ...form, tipoRisco: e.target.value as TipoRisco })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {Object.entries(TIPO_RISCO_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Setor</label>
                <input
                  value={form.setorNome}
                  onChange={(e) => setForm({ ...form, setorNome: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Função / GHE</label>
                <input
                  value={form.funcaoNome}
                  onChange={(e) => setForm({ ...form, funcaoNome: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Fonte geradora</label>
                <input
                  value={form.fonteGeradora}
                  onChange={(e) => setForm({ ...form, fonteGeradora: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Nº de expostos</label>
                <input
                  type="number"
                  min={0}
                  value={form.numeroExpostos ?? ""}
                  onChange={(e) => setForm({ ...form, numeroExpostos: e.target.value ? Number(e.target.value) : undefined })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Probabilidade (1-5)</label>
                <select
                  value={form.probabilidade ?? 3}
                  onChange={(e) => setForm({ ...form, probabilidade: Number(e.target.value) })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Severidade (1-5)</label>
                <select
                  value={form.severidade ?? 3}
                  onChange={(e) => setForm({ ...form, severidade: Number(e.target.value) })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-medium text-slate-600">Medidas de prevenção existentes</label>
                <input
                  value={form.medidasExistentes}
                  onChange={(e) => setForm({ ...form, medidasExistentes: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={loading} className="bg-sgs-700 hover:bg-sgs-800">
                Adicionar ao inventário
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </div>
        )}

        {itens.length === 0 && !showForm && (
          <p className="text-sm text-slate-500 text-center py-6">
            Nenhum risco no inventário. Adicione os perigos e riscos ocupacionais identificados.
          </p>
        )}

        {itens.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">{item.risco.nome}</span>
                <span className="text-xs text-slate-400">{TIPO_RISCO_LABELS[item.risco.tipo]}</span>
                {item.nivelRisco && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${nivelColor[item.nivelRisco]}`}>
                    {NIVEL_RISCO_LABELS[item.nivelRisco]}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {[item.setorNome, item.funcaoNome, item.fonteGeradora].filter(Boolean).join(" · ")}
                {item.numeroExpostos != null && ` · ${item.numeroExpostos} exposto(s)`}
                {item.probabilidade && item.severidade && ` · P${item.probabilidade}×S${item.severidade}`}
              </p>
              {item.medidasExistentes && (
                <p className="text-xs text-slate-400 mt-0.5">Medidas: {item.medidasExistentes}</p>
              )}
            </div>
            <button
              onClick={() => handleRemove(item.id)}
              className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
