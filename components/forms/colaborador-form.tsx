"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createColaborador,
  updateColaborador,
  type ColaboradorFormData,
} from "@/app/actions/colaboradores";
import { listSetores } from "@/app/actions/setores";
import { actionBuscarCPF, actionValidarCPF } from "@/app/actions/brasil";
import { formatCPFMask } from "@/lib/brasil";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2, Search } from "lucide-react";

type EmpresaOption = {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
};

type ColaboradorData = {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: Date | null;
  sexo: string | null;
  email: string | null;
  telefone: string | null;
  dataAdmissao: Date | null;
  empresaId: string;
  setorId: string | null;
  funcaoId: string | null;
};

type SetorComFuncoes = {
  id: string;
  nome: string;
  funcoes: { id: string; nome: string }[];
};

function toDateInput(d: Date | null | undefined) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export function ColaboradorForm({
  empresas,
  colaborador,
}: {
  empresas: EmpresaOption[];
  colaborador?: ColaboradorData;
}) {
  const router = useRouter();
  const isEditing = !!colaborador;

  const [loading, setLoading] = useState(false);
  const [loadingCpf, setLoadingCpf] = useState(false);
  const [error, setError] = useState("");
  const [cpfMsg, setCpfMsg] = useState("");
  const [setores, setSetores] = useState<SetorComFuncoes[]>([]);

  const [form, setForm] = useState<ColaboradorFormData>({
    nome: colaborador?.nome ?? "",
    cpf: colaborador?.cpf ?? "",
    dataNascimento: toDateInput(colaborador?.dataNascimento),
    sexo: colaborador?.sexo ?? "",
    email: colaborador?.email ?? "",
    telefone: colaborador?.telefone ?? "",
    dataAdmissao: toDateInput(colaborador?.dataAdmissao),
    empresaId: colaborador?.empresaId ?? (empresas[0]?.id || ""),
    setorId: colaborador?.setorId ?? "",
    funcaoId: colaborador?.funcaoId ?? "",
  });

  useEffect(() => {
    if (form.empresaId) {
      listSetores(form.empresaId).then(setSetores).catch(() => setSetores([]));
    } else {
      setSetores([]);
    }
  }, [form.empresaId]);

  const funcoesDoSetor =
    setores.find((s) => s.id === form.setorId)?.funcoes ?? [];

  function update(field: keyof ColaboradorFormData, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "empresaId") {
        next.setorId = "";
        next.funcaoId = "";
      }
      if (field === "setorId") {
        next.funcaoId = "";
      }
      return next;
    });
  }

  async function handleBuscarCpf() {
    const digits = form.cpf.replace(/\D/g, "");
    if (digits.length !== 11) {
      setCpfMsg("Informe os 11 dígitos do CPF.");
      return;
    }

    setLoadingCpf(true);
    setCpfMsg("");
    setError("");

    try {
      const result = await actionBuscarCPF(digits);

      if ("error" in result) {
        setCpfMsg(result.error);
        return;
      }

      setForm((prev) => ({
        ...prev,
        cpf: result.cpf,
        nome: result.nome || prev.nome,
        dataNascimento: result.dataNascimento || prev.dataNascimento,
        sexo: result.sexo || prev.sexo,
        email: result.email || prev.email,
        telefone: result.telefone || prev.telefone,
      }));

      setCpfMsg(result.message);
    } finally {
      setLoadingCpf(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cpfCheck = await actionValidarCPF(form.cpf);
    if (!cpfCheck.valid) {
      setError(cpfCheck.message);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...form,
        setorId: form.setorId || undefined,
        funcaoId: form.funcaoId || undefined,
      };

      if (isEditing) {
        const result = await updateColaborador(colaborador!.id, payload);
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }
        router.push(`/colaboradores/${colaborador!.id}`);
      } else {
        const result = await createColaborador(payload);
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }
        router.push(`/colaboradores/${result.id}`);
      }
      router.refresh();
    } catch {
      setError("Erro ao salvar. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">CPF *</label>
              <div className="flex gap-2">
                <input
                  required
                  value={form.cpf}
                  onChange={(e) => update("cpf", formatCPFMask(e.target.value))}
                  onBlur={() => {
                    if (form.cpf.replace(/\D/g, "").length === 11) handleBuscarCpf();
                  }}
                  placeholder="000.000.000-00"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={loadingCpf}
                  onClick={handleBuscarCpf}
                  className="shrink-0"
                >
                  {loadingCpf ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {cpfMsg && (
                <p
                  className={`text-xs ${
                    cpfMsg.includes("inválido") || cpfMsg.includes("11 dígitos")
                      ? "text-red-600"
                      : cpfMsg.includes("encontrados")
                        ? "text-emerald-600"
                        : "text-slate-500"
                  }`}
                >
                  {cpfMsg}
                </p>
              )}
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Nome completo *</label>
              <input
                required
                value={form.nome}
                onChange={(e) => update("nome", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data de nascimento</label>
              <input
                type="date"
                value={form.dataNascimento}
                onChange={(e) => update("dataNascimento", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sexo</label>
              <select
                value={form.sexo}
                onChange={(e) => update("sexo", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Selecione</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone</label>
              <input
                value={form.telefone}
                onChange={(e) => update("telefone", e.target.value)}
                placeholder="(00) 00000-0000"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="sm:col-span-2 border-t pt-4 mt-2">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Dados profissionais</h3>
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Empresa *</label>
              <select
                required
                value={form.empresaId}
                onChange={(e) => update("empresaId", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Selecione a empresa</option>
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nomeFantasia || emp.razaoSocial}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Setor</label>
              <select
                value={form.setorId}
                onChange={(e) => update("setorId", e.target.value)}
                disabled={!form.empresaId || setores.length === 0}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                <option value="">
                  {setores.length === 0 ? "Nenhum setor cadastrado" : "Selecione o setor"}
                </option>
                {setores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Função</label>
              <select
                value={form.funcaoId}
                onChange={(e) => update("funcaoId", e.target.value)}
                disabled={!form.setorId || funcoesDoSetor.length === 0}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                <option value="">
                  {funcoesDoSetor.length === 0 ? "Nenhuma função" : "Selecione a função"}
                </option>
                {funcoesDoSetor.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data de admissão</label>
              <input
                type="date"
                value={form.dataAdmissao}
                onChange={(e) => update("dataAdmissao", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="bg-sgs-700 hover:bg-sgs-800" disabled={loading}>
              {loading ? "Salvando..." : isEditing ? "Salvar alterações" : "Cadastrar colaborador"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
