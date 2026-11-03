"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { emitirASO, type ASOFormData } from "@/app/actions/exames";
import {
  CHECKLIST_ANAMNESE,
  CHECKLIST_PSICOSSOCIAL,
  serializarChecklists,
  type ChecklistRespostas,
} from "@/lib/checklists-medicina";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, FileCheck } from "lucide-react";

type Medico = { id: string; nome: string; crm: string; crmUf: string };

function ChecklistBlock({
  titulo,
  itens,
  valores,
  onChange,
}: {
  titulo: string;
  itens: typeof CHECKLIST_ANAMNESE;
  valores: ChecklistRespostas;
  onChange: (id: string, value: string) => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border p-3 bg-slate-50">
      <p className="text-sm font-semibold text-slate-800">{titulo}</p>
      {itens.map((item) => (
        <div key={item.id} className="space-y-1">
          <p className="text-xs text-slate-700">{item.pergunta}</p>
          {item.tipo === "sim_nao" ? (
            <div className="flex gap-3 text-xs">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name={item.id}
                  checked={valores[item.id] === "sim"}
                  onChange={() => onChange(item.id, "sim")}
                />
                Sim
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name={item.id}
                  checked={valores[item.id] === "nao"}
                  onChange={() => onChange(item.id, "nao")}
                />
                Não
              </label>
            </div>
          ) : (
            <input
              value={valores[item.id] || ""}
              onChange={(e) => onChange(item.id, e.target.value)}
              className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
              placeholder="Resposta"
            />
          )}
        </div>
      ))}
    </div>
  );
}

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
  const [anamnese, setAnamnese] = useState<ChecklistRespostas>({});
  const [psicossocial, setPsicossocial] = useState<ChecklistRespostas>({});

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
    checklistPsicossocial: "",
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
      const checklistPsicossocial = serializarChecklists({ anamnese, psicossocial });
      const result = await emitirASO({ ...form, checklistPsicossocial });
      if ("error" in result && result.error) {
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
            Conteúdo mínimo NR-7 item 7.5.19.1. Inclua anamnese e checklist psicossocial antes de
            emitir.
          </p>

          <ChecklistBlock
            titulo="1. Checklist de anamnese ocupacional"
            itens={CHECKLIST_ANAMNESE}
            valores={anamnese}
            onChange={(id, v) => setAnamnese((p) => ({ ...p, [id]: v }))}
          />

          <ChecklistBlock
            titulo="2. Checklist psicossocial / comportamental"
            itens={CHECKLIST_PSICOSSOCIAL}
            valores={psicossocial}
            onChange={(id, v) => setPsicossocial((p) => ({ ...p, [id]: v }))}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Data do exame clínico</label>
            <input
              type="date"
              required
              value={form.dataExame}
              onChange={(e) => update("dataExame", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Riscos ocupacionais do PGR (alínea c) *</label>
            <textarea
              required
              value={form.riscosOcupacionais}
              onChange={(e) => update("riscosOcupacionais", e.target.value)}
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Exames realizados (alínea d) *</label>
            <input
              required
              value={form.examesRealizados}
              onChange={(e) => update("examesRealizados", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Conclusão (alínea e) *</label>
            <select
              required
              value={form.conclusao}
              onChange={(e) => update("conclusao", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="APTO">APTO para a função</option>
              <option value="INAPTO">INAPTO para a função</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Restrições / aptidão específica</label>
            <input
              value={form.restricoes}
              onChange={(e) => update("restricoes", e.target.value)}
              placeholder="Ex: Apto para NR-35"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          {medicos.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Médico examinador</label>
              <select
                onChange={(e) => selectMedico(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {medicos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome} — CRM {m.crm}/{m.crmUf}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Nome do médico</label>
              <input
                value={form.medicoNome}
                onChange={(e) => update("medicoNome", e.target.value)}
                className="flex h-9 w-full rounded-md border px-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">CRM</label>
              <input
                value={form.medicoCrm}
                onChange={(e) => update("medicoCrm", e.target.value)}
                className="flex h-9 w-full rounded-md border px-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">UF</label>
              <input
                value={form.medicoCrmUf}
                onChange={(e) => update("medicoCrmUf", e.target.value)}
                className="flex h-9 w-full rounded-md border px-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Médico coordenador PCMSO</label>
              <input
                value={form.medicoCoordNome}
                onChange={(e) => update("medicoCoordNome", e.target.value)}
                className="flex h-9 w-full rounded-md border px-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">CRM coordenador</label>
              <input
                value={form.medicoCoordCrm}
                onChange={(e) => update("medicoCoordCrm", e.target.value)}
                className="flex h-9 w-full rounded-md border px-2 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Observações do ASO</label>
            <textarea
              rows={2}
              value={form.observacoes}
              onChange={(e) => update("observacoes", e.target.value)}
              className="flex w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>

          <Button type="submit" className="w-full bg-sgs-700 hover:bg-sgs-800" disabled={loading}>
            {loading ? "Emitindo..." : "Emitir ASO com checklists"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
