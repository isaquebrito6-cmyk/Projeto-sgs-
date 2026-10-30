"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEmpresa, updateEmpresa, type EmpresaFormData } from "@/app/actions/empresas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

type Empresa = {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  cnpj: string;
  inscricaoEstadual: string | null;
  endereco: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;
  telefone: string | null;
  email: string | null;
  grauRisco: number | null;
  cnae: string | null;
  numeroFuncionarios: number | null;
};

const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export function EmpresaForm({ empresa }: { empresa?: Empresa }) {
  const router = useRouter();
  const isEditing = !!empresa;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<EmpresaFormData>({
    razaoSocial: empresa?.razaoSocial ?? "",
    nomeFantasia: empresa?.nomeFantasia ?? "",
    cnpj: empresa?.cnpj ?? "",
    inscricaoEstadual: empresa?.inscricaoEstadual ?? "",
    endereco: empresa?.endereco ?? "",
    cidade: empresa?.cidade ?? "",
    uf: empresa?.uf ?? "",
    cep: empresa?.cep ?? "",
    telefone: empresa?.telefone ?? "",
    email: empresa?.email ?? "",
    grauRisco: empresa?.grauRisco ?? undefined,
    cnae: empresa?.cnae ?? "",
    numeroFuncionarios: empresa?.numeroFuncionarios ?? undefined,
  });

  function update(field: keyof EmpresaFormData, value: string | number | undefined) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isEditing) {
        const result = await updateEmpresa(empresa!.id, form);
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }
        router.push(`/empresas/${empresa!.id}`);
      } else {
        const result = await createEmpresa(form);
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }
        router.push(`/empresas/${result.id}`);
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
            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Razão Social *</label>
              <input required value={form.razaoSocial} onChange={(e) => update("razaoSocial", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Nome Fantasia</label>
              <input value={form.nomeFantasia} onChange={(e) => update("nomeFantasia", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">CNPJ *</label>
              <input required value={form.cnpj} onChange={(e) => update("cnpj", e.target.value)} placeholder="00.000.000/0000-00"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Inscrição Estadual</label>
              <input value={form.inscricaoEstadual} onChange={(e) => update("inscricaoEstadual", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">CNAE</label>
              <input value={form.cnae} onChange={(e) => update("cnae", e.target.value)} placeholder="0000-0/00"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Grau de Risco (NR-4)</label>
              <select value={form.grauRisco ?? ""} onChange={(e) => update("grauRisco", e.target.value ? Number(e.target.value) : undefined)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">Selecione</option>
                <option value="1">Grau 1</option>
                <option value="2">Grau 2</option>
                <option value="3">Grau 3</option>
                <option value="4">Grau 4</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nº de Funcionários</label>
              <input type="number" min={0} value={form.numeroFuncionarios ?? ""} onChange={(e) => update("numeroFuncionarios", e.target.value ? Number(e.target.value) : undefined)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Endereço</label>
              <input value={form.endereco} onChange={(e) => update("endereco", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cidade</label>
              <input value={form.cidade} onChange={(e) => update("cidade", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">UF</label>
                <select value={form.uf ?? ""} onChange={(e) => update("uf", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">—</option>
                  {UFS.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">CEP</label>
                <input value={form.cep} onChange={(e) => update("cep", e.target.value)} placeholder="00000-000"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone</label>
              <input value={form.telefone} onChange={(e) => update("telefone", e.target.value)} placeholder="(00) 00000-0000"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">E-mail</label>
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="bg-sgs-700 hover:bg-sgs-800" disabled={loading}>
              {loading ? "Salvando..." : isEditing ? "Salvar alterações" : "Cadastrar empresa"}
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
