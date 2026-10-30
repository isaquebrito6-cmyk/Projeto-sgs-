"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { emitirASO, type ASOFormData } from "@/app/actions/exames";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, FileCheck } from "lucide-react";

type Medico = { id: string; nome: string; crm: string; crmUf: string };

export function ASOEmitirForm({
  solicitacaoId,
  riscosDefault,
  examesDefault,
  medicos,
}: {
  solicitacaoId: string;
  riscosDefault: string;
  examesDefault: string;
  medicos: Medico[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<ASOFormData>({
    solicitacaoId,
    dataExame: new Date().toISOString().slice(0, 10),
    riscosOcupacionais: riscosDefault,
    examesRealizados: examesDefault,
    conclusao: "APTO",
    restricoes: "",
    medicoNome: medicos[0]?.nome || "",
    medicoCrm: medicos[0]?.crm || "",
    medicoCrmUf: medicos[0]?.crmUf || "",
    medicoCoordNome: "",
    medicoCoordCrm: "",
    observacoes: "",
  });

  function update(field: keyof ASOFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function selectMedico(medicoId: string) {
    const m = medicos.find((x) => x.id === medicoId);
    if (m) {
      setForm((prev) => ({
        ...prev,
        medicoNome: m.nome,
        medicoCrm: m.crm,
        medicoCrmUf: m.crmUf,
      }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await emitirASO(form);
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Erro ao emitir ASO.");
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileCheck className="w-5 h-5" /> Emitir ASO (NR-7)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <p className="text-xs text-slate-500">
            Campos obrigatórios conforme NR-7, item 7.5.19.1 (alíneas a–g).
          </p>

          <div className="space-y-2">
            <label className="text-sm font-medium">Data do exame clínico</label>
            <input type="date" required value={form.dataExame} onChange={(e) => update("dataExame", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Riscos ocupacionais do PGR (alínea c) *</label>
            <textarea required value={form.riscosOcupacionais} onChange={(e) => update("riscosOcupacionais", e.target.value)} rows={2}
              placeholder="Descrição dos perigos/fatores de risco do PGR que necessitam controle médico, ou declarar inexistência"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Exames realizados (alínea d) *</label>
            <input required value={form.examesRealizados} onChange={(e) => update("examesRealizados", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Conclusão (alínea e) *</label>
            <select required value={form.conclusao} onChange={(e) => update("conclusao", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="APTO">APTO para a função</option>
              <option value="INAPTO">INAPTO para a função</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Restrições / aptidão específica (NR-10, NR-33, NR-35 etc.)</label>
            <input value={form.restricoes} onChange={(e) => update("restricoes", e.target.value)}
              placeholder="Ex: Apto para trabalho em altura (NR-35)"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>

          {medicos.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Selecionar médico examinador</label>
              <select onChange={(e) => selectMedico(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {medicos.map((m) => (
                  <option key={m.id} value={m.id}>{m.nome} — CRM {m.crm}/{m.crmUf}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Médico examinador (alínea g)</label>
              <input value={form.medicoNome} onChange={(e) => update("medicoNome", e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">CRM</label>
              <input value={form.medicoCrm} onChange={(e) => update("medicoCrm", e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">UF</label>
              <input value={form.medicoCrmUf} onChange={(e) => update("medicoCrmUf", e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Médico coordenador PCMSO (alínea f)</label>
              <input value={form.medicoCoordNome} onChange={(e) => update("medicoCoordNome", e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">CRM coordenador</label>
              <input value={form.medicoCoordCrm} onChange={(e) => update("medicoCoordCrm", e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
          </div>

          <Button type="submit" className="w-full bg-sgs-700 hover:bg-sgs-800" disabled={loading}>
            {loading ? "Emitindo..." : "Emitir ASO"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
