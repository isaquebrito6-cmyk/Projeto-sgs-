"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NovaEmpresaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    razaoSocial: "",
    nomeFantasia: "",
    cnpj: "",
    inscricaoEstadual: "",
    endereco: "",
    cidade: "",
    uf: "",
    cep: "",
    telefone: "",
    email: "",
    grauRisco: "",
    cnae: "",
    numeroFuncionarios: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/empresas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          grauRisco: form.grauRisco ? Number(form.grauRisco) : null,
          numeroFuncionarios: form.numeroFuncionarios
            ? Number(form.numeroFuncionarios)
            : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao cadastrar empresa.");
        setLoading(false);
        return;
      }

      router.push(`/empresas/${data.id}`);
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/empresas">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nova empresa</h1>
          <p className="text-slate-500 text-sm">Preencha os dados cadastrais da empresa</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Dados da empresa</CardTitle>
            <CardDescription>Informações básicas e de contato</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-2">
                <label className="text-sm font-medium">Razão Social *</label>
                <input
                  name="razaoSocial"
                  required
                  value={form.razaoSocial}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="text-sm font-medium">Nome Fantasia</label>
                <input
                  name="nomeFantasia"
                  value={form.nomeFantasia}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">CNPJ *</label>
                <input
                  name="cnpj"
                  required
                  value={form.cnpj}
                  onChange={handleChange}
                  placeholder="00.000.000/0000-00"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Inscrição Estadual</label>
                <input
                  name="inscricaoEstadual"
                  value={form.inscricaoEstadual}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="text-sm font-medium">Endereço</label>
                <input
                  name="endereco"
                  value={form.endereco}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Cidade</label>
                <input
                  name="cidade"
                  value={form.cidade}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">UF</label>
                  <input
                    name="uf"
                    value={form.uf}
                    onChange={handleChange}
                    maxLength={2}
                    placeholder="PR"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">CEP</label>
                  <input
                    name="cep"
                    value={form.cep}
                    onChange={handleChange}
                    placeholder="00000-000"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Telefone</label>
                <input
                  name="telefone"
                  value={form.telefone}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">E-mail</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Grau de Risco (NR-4)</label>
                <select
                  name="grauRisco"
                  value={form.grauRisco}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Selecione</option>
                  <option value="1">1 - Baixo</option>
                  <option value="2">2 - Médio</option>
                  <option value="3">3 - Alto</option>
                  <option value="4">4 - Muito Alto</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">CNAE</label>
                <input
                  name="cnae"
                  value={form.cnae}
                  onChange={handleChange}
                  placeholder="0000-0/00"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nº de Funcionários</label>
                <input
                  name="numeroFuncionarios"
                  type="number"
                  min="0"
                  value={form.numeroFuncionarios}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link href="/empresas">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" className="bg-sgs-700 hover:bg-sgs-800" disabled={loading}>
                <Save className="w-4 h-4" />
                {loading ? "Salvando..." : "Salvar empresa"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
