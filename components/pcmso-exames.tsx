"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ClipboardList } from "lucide-react";
import { addExamePCMSO, removeExamePCMSO, type ExamePCMSOData } from "@/app/actions/pcmso";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TIPOS_EXAME } from "@/types";

type Exame = {
  id: string;
  nomeExame: string;
  tipo: string;
  periodicidade: string | null;
  setoresAplicaveis: string | null;
  funcoesAplicaveis: string | null;
};

export function PCMSOExames({ pcmsoId, exames }: { pcmsoId: string; exames: Exame[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ExamePCMSOData>({
    nomeExame: "",
    tipo: "Periódico",
    periodicidade: "Anual",
  });

  async function handleAdd() {
    if (!form.nomeExame.trim()) return;
    setLoading(true);
    await addExamePCMSO(pcmsoId, form);
    setForm({ nomeExame: "", tipo: "Periódico", periodicidade: "Anual" });
    setShowForm(false);
    setLoading(false);
    router.refresh();
  }

  async function handleRemove(id: string) {
    if (!confirm("Remover este exame?")) return;
    setLoading(true);
    await removeExamePCMSO(id, pcmsoId);
    setLoading(false);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <ClipboardList className="w-4 h-4" />
          Exames do PCMSO
          <span className="text-sm font-normal text-slate-400">({exames.length})</span>
        </CardTitle>
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)} disabled={loading}>
          <Plus className="w-4 h-4" /> Adicionar exame
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <div className="p-4 rounded-lg bg-slate-50 border space-y-3">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Nome do exame *</label>
                <input autoFocus value={form.nomeExame} onChange={(e) => setForm({ ...form, nomeExame: e.target.value })}
                  placeholder="Ex: Audiometria, Espirometria..."
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Tipo</label>
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {TIPOS_EXAME.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Periodicidade</label>
                <input value={form.periodicidade} onChange={(e) => setForm({ ...form, periodicidade: e.target.value })}
                  placeholder="Anual, Bienal..."
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={loading} className="bg-sgs-700 hover:bg-sgs-800">Adicionar</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </div>
        )}

        {exames.length === 0 && !showForm && (
          <p className="text-sm text-slate-500 text-center py-6">Nenhum exame definido.</p>
        )}

        <div className="divide-y">
          {exames.map((ex) => (
            <div key={ex.id} className="flex items-center justify-between py-2.5">
              <div>
                <span className="font-medium text-sm">{ex.nomeExame}</span>
                <span className="text-xs text-slate-400 ml-2">{ex.tipo}</span>
                {ex.periodicidade && <span className="text-xs text-slate-400 ml-1">· {ex.periodicidade}</span>}
              </div>
              <button onClick={() => handleRemove(ex.id)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
