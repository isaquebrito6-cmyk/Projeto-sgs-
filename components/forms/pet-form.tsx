"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPET, type PetForm } from "@/app/actions/operacional";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

type EmpresaOption = { id: string; razaoSocial: string; nomeFantasia: string | null };

export function PetForm({ empresas }: { empresas: EmpresaOption[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<PetForm>({
    empresaId: empresas[0]?.id || "",
    numero: "",
    identificacaoEspaco: "",
    local: "",
    atividade: "",
    dataEntrada: new Date().toISOString().slice(0, 16),
    dataSaidaPrevista: "",
    atmosfera: "",
    oxigenioPercentual: "",
    gasesMedidos: "",
    ventilacao: "",
    epiEpc: "",
    riscosAdicionais: "",
    procedimentosEntrada: "",
    procedimentosEmergencia: "",
    supervisorNome: "",
    vigiaNome: "",
    trabalhadoresNomes: "",
    observacoes: "",
  });

  function update<K extends keyof PetForm>(field: K, value: PetForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await createPET({
        ...form,
        dataEntrada:
          form.dataEntrada.length === 16 ? form.dataEntrada + ":00" : form.dataEntrada,
        dataSaidaPrevista: form.dataSaidaPrevista
          ? form.dataSaidaPrevista.length === 16
            ? form.dataSaidaPrevista + ":00"
            : form.dataSaidaPrevista
          : undefined,
      });
      if ("error" in res) {
        setError(res.error);
        setLoading(false);
        return;
      }
      router.push(`/pet/${res.id}`);
      router.refresh();
    } catch {
      setError("Erro ao salvar PET.");
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

          <p className="text-xs text-slate-500">
            Conforme NR-33 — Permissão de Entrada e Trabalho em espaço confinado.
          </p>

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
              <label className="text-sm font-medium">Nº PET</label>
              <input
                value={form.numero}
                onChange={(e) => update("numero", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Identificação do espaço *</label>
              <input
                required
                value={form.identificacaoEspaco}
                onChange={(e) => update("identificacaoEspaco", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Ex.: Tanque TQ-03"
              />
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
              <label className="text-sm font-medium">Entrada *</label>
              <input
                type="datetime-local"
                required
                value={form.dataEntrada}
                onChange={(e) => update("dataEntrada", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Saída prevista</label>
              <input
                type="datetime-local"
                value={form.dataSaidaPrevista}
                onChange={(e) => update("dataSaidaPrevista", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Atmosfera / condição</label>
              <input
                value={form.atmosfera}
                onChange={(e) => update("atmosfera", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">O₂ (%)</label>
              <input
                value={form.oxigenioPercentual}
                onChange={(e) => update("oxigenioPercentual", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="19,5 – 23"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Gases medidos</label>
              <input
                value={form.gasesMedidos}
                onChange={(e) => update("gasesMedidos", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Ventilação</label>
              <input
                value={form.ventilacao}
                onChange={(e) => update("ventilacao", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">EPI / EPC</label>
              <input
                value={form.epiEpc}
                onChange={(e) => update("epiEpc", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Riscos adicionais</label>
              <textarea
                rows={2}
                value={form.riscosAdicionais}
                onChange={(e) => update("riscosAdicionais", e.target.value)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Procedimentos de entrada</label>
              <textarea
                rows={2}
                value={form.procedimentosEntrada}
                onChange={(e) => update("procedimentosEntrada", e.target.value)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Procedimentos de emergência</label>
              <textarea
                rows={2}
                value={form.procedimentosEmergencia}
                onChange={(e) => update("procedimentosEmergencia", e.target.value)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Supervisor de entrada</label>
              <input
                value={form.supervisorNome}
                onChange={(e) => update("supervisorNome", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Vigia</label>
              <input
                value={form.vigiaNome}
                onChange={(e) => update("vigiaNome", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Trabalhadores autorizados</label>
              <textarea
                rows={2}
                value={form.trabalhadoresNomes}
                onChange={(e) => update("trabalhadoresNomes", e.target.value)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Nomes separados por vírgula"
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
              {loading ? "Salvando..." : "Emitir PET"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/pet")}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
