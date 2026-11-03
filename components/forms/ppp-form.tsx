"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createPPP, type PppForm } from "@/app/actions/operacional";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

type EmpresaOption = { id: string; razaoSocial: string; nomeFantasia: string | null };
type ColabOption = { id: string; nome: string; empresaId: string };

export function PppForm({
  empresas,
  colaboradores,
}: {
  empresas: EmpresaOption[];
  colaboradores: ColabOption[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<PppForm>({
    empresaId: empresas[0]?.id || "",
    colaboradorId: "",
    nit: "",
    ctpsNumero: "",
    ctpsSerie: "",
    dataAdmissao: "",
    dataDemissao: "",
    lotacao: "",
    descricaoAtividades: "",
    fatoresRisco: "",
    profissionalResponsavel: "",
    registroProfissional: "",
    observacoes: "",
  });

  const colabs = useMemo(
    () => colaboradores.filter((c) => c.empresaId === form.empresaId),
    [colaboradores, form.empresaId]
  );

  function update<K extends keyof PppForm>(field: K, value: PppForm[K]) {
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
      setError("Selecione o colaborador.");
      return;
    }
    setLoading(true);
    try {
      const res = await createPPP(form);
      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      router.push(`/ppp/${res.id}`);
      router.refresh();
    } catch {
      setError("Erro ao salvar PPP.");
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
            Base do Perfil Profissiográfico Previdenciário para arquivo interno e apoio à emissão oficial.
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

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Colaborador *</label>
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
              <label className="text-sm font-medium">NIT</label>
              <input
                value={form.nit}
                onChange={(e) => update("nit", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">CTPS (nº / série)</label>
              <div className="flex gap-2">
                <input
                  value={form.ctpsNumero}
                  onChange={(e) => update("ctpsNumero", e.target.value)}
                  placeholder="Número"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <input
                  value={form.ctpsSerie}
                  onChange={(e) => update("ctpsSerie", e.target.value)}
                  placeholder="Série"
                  className="flex h-10 w-28 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Admissão</label>
              <input
                type="date"
                value={form.dataAdmissao}
                onChange={(e) => update("dataAdmissao", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Demissão</label>
              <input
                type="date"
                value={form.dataDemissao}
                onChange={(e) => update("dataDemissao", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Lotação / setor</label>
              <input
                value={form.lotacao}
                onChange={(e) => update("lotacao", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Descrição das atividades</label>
              <textarea
                rows={3}
                value={form.descricaoAtividades}
                onChange={(e) => update("descricaoAtividades", e.target.value)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Fatores de risco</label>
              <textarea
                rows={3}
                value={form.fatoresRisco}
                onChange={(e) => update("fatoresRisco", e.target.value)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Agentes físicos, químicos, biológicos, ergonômicos..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Profissional responsável</label>
              <input
                value={form.profissionalResponsavel}
                onChange={(e) => update("profissionalResponsavel", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Registro profissional</label>
              <input
                value={form.registroProfissional}
                onChange={(e) => update("registroProfissional", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="CREA / CRT..."
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
              {loading ? "Salvando..." : "Salvar PPP"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/ppp")}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
