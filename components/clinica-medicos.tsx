"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, UserCheck } from "lucide-react";
import { createMedico, deleteMedico } from "@/app/actions/clinicas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Medico = {
  id: string;
  nome: string;
  crm: string;
  crmUf: string;
  especialidade: string | null;
};

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

export function ClinicaMedicos({ clinicaId, medicos }: { clinicaId: string; medicos: Medico[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nome: "", crm: "", crmUf: "PR", especialidade: "Medicina do Trabalho" });

  async function handleCreate() {
    if (!form.nome.trim() || !form.crm.trim()) return;
    setLoading(true);
    await createMedico({ ...form, clinicaId });
    setForm({ nome: "", crm: "", crmUf: "PR", especialidade: "Medicina do Trabalho" });
    setShowForm(false);
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este médico?")) return;
    setLoading(true);
    await deleteMedico(id, clinicaId);
    setLoading(false);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Médicos</CardTitle>
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)} disabled={loading}>
          <Plus className="w-4 h-4" />
          Novo médico
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <div className="p-3 rounded-lg bg-slate-50 border space-y-2">
            <input
              autoFocus
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Nome do médico"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                value={form.crm}
                onChange={(e) => setForm({ ...form, crm: e.target.value })}
                placeholder="CRM"
                className="flex h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <select
                value={form.crmUf}
                onChange={(e) => setForm({ ...form, crmUf: e.target.value })}
                className="flex h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {UFS.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
              <input
                value={form.especialidade}
                onChange={(e) => setForm({ ...form, especialidade: e.target.value })}
                placeholder="Especialidade"
                className="flex h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} disabled={loading} className="bg-sgs-700 hover:bg-sgs-800">
                Salvar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {medicos.length === 0 && !showForm && (
          <p className="text-sm text-slate-500 text-center py-4">Nenhum médico cadastrado.</p>
        )}

        {medicos.map((m) => (
          <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-teal-700" />
              </div>
              <div>
                <p className="font-medium text-sm">{m.nome}</p>
                <p className="text-xs text-slate-500">
                  CRM {m.crm}/{m.crmUf}
                  {m.especialidade && <> · {m.especialidade}</>}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(m.id)}
              className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
