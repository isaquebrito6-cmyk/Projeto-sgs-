"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createCAT, type CatForm } from "@/app/actions/operacional";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

type EmpresaOption = { id: string; razaoSocial: string; nomeFantasia: string | null };
type ColabOption = { id: string; nome: string; empresaId: string };

export function CatForm({
  empresas,
  colaboradores,
}: {
  empresas: EmpresaOption[];
  colaboradores: ColabOption[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<CatForm>({
    empresaId: empresas[0]?.id || "",
    colaboradorId: "",
    tipo: "INICIAL",
    dataAcidente: new Date().toISOString().slice(0, 10),
    horaAcidente: "",
    localAcidente: "",
    descricao: "",
    parteCorpoAtingida: "",
    agenteCausador: "",
    houveAfastamento: false,
    testemunhas: "",
    observacoes: "",
    emitidoPor: "",
  });

  const colabs = useMemo(
    () => colaboradores.filter((c) => c.empresaId === form.empresaId),
    [colaboradores, form.empresaId]
  );

  function update<K extends keyof CatForm>(field: K, value: CatForm[K]) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "empresaId") next.colaboradorId = "";
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.colaboradorId) {
      setError("Selecione o colaborador acidentado.");
      return;
    }
    setLoading(true);
    try {
      const res = await createCAT(form);
      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      router.push(`/cat/${res.id}`);
      router.refresh();
    } catch {
      setError("Erro ao salvar CAT.");
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

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Colaborador acidentado *</label>
              <select
                required
                value={form.colaboradorId}
                onChange={(e) => update("colaboradorId", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione</option>
                {colabs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de CAT</label>
              <select
                value={form.tipo}
                onChange={(e) => update("tipo", e.target.value as CatForm["tipo"])}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="INICIAL">Inicial</option>
                <option value="REABERTURA">Reabertura</option>
                <option value="COMUNICACAO_OBITO">Comunicação de óbito</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data do acidente *</label>
              <input
                type="date"
                required
                value={form.dataAcidente}
                onChange={(e) => update("dataAcidente", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hora</label>
              <input
                type="time"
                value={form.horaAcidente}
                onChange={(e) => update("horaAcidente", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Local do acidente</label>
              <input
                value={form.localAcidente}
                onChange={(e) => update("localAcidente", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Descrição do acidente *</label>
              <textarea
                required
                rows={4}
                value={form.descricao}
                onChange={(e) => update("descricao", e.target.value)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Como ocorreu, o que o trabalhador fazia, circunstâncias..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Parte do corpo atingida</label>
              <input
                value={form.parteCorpoAtingida}
                onChange={(e) => update("parteCorpoAtingida", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Agente causador</label>
              <input
                value={form.agenteCausador}
                onChange={(e) => update("agenteCausador", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-2">
              <input
                id="afastamento"
                type="checkbox"
                checked={!!form.houveAfastamento}
                onChange={(e) => update("houveAfastamento", e.target.checked)}
              />
              <label htmlFor="afastamento" className="text-sm">
                Houve afastamento do trabalho
              </label>
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Testemunhas</label>
              <input
                value={form.testemunhas}
                onChange={(e) => update("testemunhas", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Emitido por</label>
              <input
                value={form.emitidoPor}
                onChange={(e) => update("emitidoPor", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
              {loading ? "Salvando..." : "Salvar CAT"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/cat")}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
