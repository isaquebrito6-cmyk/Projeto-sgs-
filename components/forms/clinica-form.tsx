"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClinica, updateClinica, type ClinicaFormData } from "@/app/actions/clinicas";
import { actionBuscarCEP, actionBuscarCNPJ } from "@/app/actions/brasil";
import { formatCNPJMask, formatCEP } from "@/lib/brasil";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2, Search } from "lucide-react";

type Clinica = {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  cnpj: string;
  endereco: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;
  telefone: string | null;
  email: string | null;
};

const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export function ClinicaForm({ clinica }: { clinica?: Clinica }) {
  const router = useRouter();
  const isEditing = !!clinica;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  const [form, setForm] = useState<ClinicaFormData>({
    razaoSocial: clinica?.razaoSocial ?? "",
    nomeFantasia: clinica?.nomeFantasia ?? "",
    cnpj: clinica?.cnpj ?? "",
    endereco: clinica?.endereco ?? "",
    cidade: clinica?.cidade ?? "",
    uf: clinica?.uf ?? "",
    cep: clinica?.cep ?? "",
    telefone: clinica?.telefone ?? "",
    email: clinica?.email ?? "",
  });

  function update(field: keyof ClinicaFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCNPJ() {
    const digits = form.cnpj.replace(/\D/g, "");
    if (digits.length !== 14) return;
    setLoadingCnpj(true);
    setInfo("");
    try {
      const result = await actionBuscarCNPJ(digits);
      if ("error" in result) {
        setInfo(result.error);
        return;
      }
      setForm((prev) => ({
        ...prev,
        cnpj: result.cnpj,
        razaoSocial: result.razaoSocial || prev.razaoSocial,
        nomeFantasia: result.nomeFantasia || prev.nomeFantasia,
        endereco: result.endereco || prev.endereco,
        cidade: result.cidade || prev.cidade,
        uf: result.uf || prev.uf,
        cep: result.cep || prev.cep,
        telefone: result.telefone || prev.telefone,
        email: result.email || prev.email,
      }));
      setInfo("Dados do CNPJ preenchidos.");
    } finally {
      setLoadingCnpj(false);
    }
  }

  async function handleCEP() {
    const digits = (form.cep || "").replace(/\D/g, "");
    if (digits.length !== 8) return;
    setLoadingCep(true);
    setInfo("");
    try {
      const result = await actionBuscarCEP(digits);
      if ("error" in result) {
        setInfo(result.error);
        return;
      }
      setForm((prev) => ({
        ...prev,
        cep: result.cep,
        endereco: result.logradouro
          ? `${result.logradouro}${result.bairro ? ` - ${result.bairro}` : ""}`
          : prev.endereco,
        cidade: result.localidade || prev.cidade,
        uf: result.uf || prev.uf,
      }));
      setInfo("Endereço preenchido pelo CEP.");
    } finally {
      setLoadingCep(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isEditing) {
        const result = await updateClinica(clinica!.id, form);
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }
        router.push(`/clinicas/${clinica!.id}`);
      } else {
        const result = await createClinica(form);
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }
        router.push(`/clinicas/${result.id}`);
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
          {info && !error && (
            <div className="rounded-md bg-sgs-50 border border-sgs-200 px-3 py-2 text-sm text-sgs-800">{info}</div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">CNPJ *</label>
              <div className="flex gap-2">
                <input
                  required
                  value={form.cnpj}
                  onChange={(e) => update("cnpj", formatCNPJMask(e.target.value))}
                  onBlur={handleCNPJ}
                  placeholder="00.000.000/0000-00"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button type="button" variant="outline" disabled={loadingCnpj} onClick={handleCNPJ} className="shrink-0">
                  {loadingCnpj ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
            </div>
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
              <label className="text-sm font-medium">CEP</label>
              <div className="flex gap-2">
                <input
                  value={form.cep}
                  onChange={(e) => update("cep", formatCEP(e.target.value))}
                  onBlur={handleCEP}
                  placeholder="00000-000"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button type="button" variant="outline" disabled={loadingCep} onClick={handleCEP} className="shrink-0">
                  {loadingCep ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone</label>
              <input value={form.telefone} onChange={(e) => update("telefone", e.target.value)}
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
              <label className="text-sm font-medium">E-mail</label>
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="bg-sgs-700 hover:bg-sgs-800" disabled={loading}>
              {loading ? "Salvando..." : isEditing ? "Salvar alterações" : "Cadastrar clínica"}
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
