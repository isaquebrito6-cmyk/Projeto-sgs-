"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ListChecks } from "lucide-react";
import { addPlanoAcaoItem, removePlanoAcaoItem, updatePlanoAcaoStatus, type PlanoAcaoData } from "@/app/actions/pgr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

type Item = {
  id: string;
  descricaoAcao: string;
  riscoRelacionado: string | null;
  responsavel: string | null;
  prazo: Date | null;
  status: string;
  prioridade: string | null;
};

const statusOptions = ["Pendente", "Em andamento", "Concluído"];

export function PGRPlanoAcao({ pgrId, itens }: { pgrId: string; itens: Item[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<PlanoAcaoData>({
    descricaoAcao: "",
    riscoRelacionado: "",
    responsavel: "",
    prazo: "",
    prioridade: "Média",
  });

  async function handleAdd() {
    if (!form.descricaoAcao.trim()) return;
    setLoading(true);
    await addPlanoAcaoItem(pgrId, form);
    setForm({ descricaoAcao: "", riscoRelacionado: "", responsavel: "", prazo: "", prioridade: "Média" });
    setShowForm(false);
    setLoading(false);
    router.refresh();
  }

  async function handleRemove(id: string) {
    if (!confirm("Remover esta ação?")) return;
    setLoading(true);
    await removePlanoAcaoItem(id, pgrId);
    setLoading(false);
    router.refresh();
  }

  async function handleStatus(id: string, status: string) {
    setLoading(true);
    await updatePlanoAcaoStatus(id, status, pgrId);
    setLoading(false);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <ListChecks className="w-4 h-4" />
          Plano de Ação
          <span className="text-sm font-normal text-slate-400">({itens.length})</span>
        </CardTitle>
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)} disabled={loading}>
          <Plus className="w-4 h-4" />
          Nova ação
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <div className="p-4 rounded-lg bg-slate-50 border space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Descrição da ação *</label>
              <input
                autoFocus
                value={form.descricaoAcao}
                onChange={(e) => setForm({ ...form, descricaoAcao: e.target.value })}
                placeholder="Ex: Instalar proteção coletiva no equipamento X"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Risco relacionado</label>
                <input
                  value={form.riscoRelacionado}
                  onChange={(e) => setForm({ ...form, riscoRelacionado: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Responsável</label>
                <input
                  value={form.responsavel}
                  onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Prazo</label>
                <input
                  type="date"
                  value={form.prazo}
                  onChange={(e) => setForm({ ...form, prazo: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={loading} className="bg-sgs-700 hover:bg-sgs-800">
                Adicionar ação
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </div>
        )}

        {itens.length === 0 && !showForm && (
          <p className="text-sm text-slate-500 text-center py-6">
            Nenhuma ação cadastrada. Defina as medidas de prevenção e controle.
          </p>
        )}

        {itens.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm">{item.descricaoAcao}</p>
              <p className="text-xs text-slate-500 mt-1">
                {[item.riscoRelacionado, item.responsavel, item.prazo ? `Prazo: ${formatDate(item.prazo)}` : null]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={item.status}
                onChange={(e) => handleStatus(item.id, e.target.value)}
                className="h-7 rounded border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                onClick={() => handleRemove(item.id)}
                className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
