"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  importColaboradores,
  parseImportRows,
} from "@/app/actions/import-colaboradores";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Upload } from "lucide-react";

type EmpresaOption = { id: string; razaoSocial: string; nomeFantasia: string | null };

export function ImportColaboradoresForm({ empresas }: { empresas: EmpresaOption[] }) {
  const router = useRouter();
  const [empresaId, setEmpresaId] = useState(empresas[0]?.id || "");
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    criados: number;
    atualizados: number;
    erros: { linha: number; mensagem: string }[];
  } | null>(null);

  const preview = texto.trim() ? parseImportRows(texto) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!empresaId) {
      setError("Selecione a empresa.");
      return;
    }
    if (!texto.trim()) {
      setError("Cole a lista ou o conteúdo do CSV.");
      return;
    }

    setLoading(true);
    try {
      const res = await importColaboradores(empresaId, texto);
      if ("error" in res) {
        setError(res.error);
        setLoading(false);
        return;
      }
      setResult(res);
      router.refresh();
    } catch {
      setError("Falha na importação.");
    } finally {
      setLoading(false);
    }
  }

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      setTexto(String(reader.result || ""));
    };
    reader.readAsText(file, "UTF-8");
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {result && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 space-y-1">
              <p>
                <strong>{result.criados}</strong> criados ·{" "}
                <strong>{result.atualizados}</strong> atualizados
                {result.erros.length > 0 && (
                  <> · <strong className="text-amber-800">{result.erros.length}</strong> com erro</>
                )}
              </p>
              {result.erros.slice(0, 8).map((e) => (
                <p key={e.linha} className="text-xs text-amber-800">
                  Linha {e.linha}: {e.mensagem}
                </p>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Empresa *</label>
            <select
              required
              value={empresaId}
              onChange={(e) => setEmpresaId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Selecione</option>
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nomeFantasia || e.razaoSocial}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Arquivo CSV (opcional)</label>
            <input
              type="file"
              accept=".csv,.txt,text/csv,text/plain"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-sgs-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-sgs-800"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Colar lista / CSV *</label>
            <p className="text-xs text-slate-500">
              Aceita cabeçalho (Nome, CPF, Setor, Função, E-mail, Telefone) separados por vírgula,
              ponto e vírgula ou tab. Setor/função inexistentes são criados automaticamente.
            </p>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={10}
              placeholder={"Nome;CPF;Setor;Função\nMaria Silva;12345678909;Produção;Operador"}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {preview && preview.rows.length > 0 && (
            <div className="rounded-md border bg-slate-50 p-3 text-xs text-slate-600">
              <p className="font-medium text-slate-800 mb-1">
                Pré-visualização: {preview.rows.length} linha(s)
              </p>
              {preview.avisos.map((a) => (
                <p key={a} className="text-amber-700">{a}</p>
              ))}
              <ul className="mt-2 space-y-0.5 max-h-32 overflow-auto">
                {preview.rows.slice(0, 5).map((r, i) => (
                  <li key={i}>
                    {r.nome} — {r.cpf}
                    {r.setor ? ` · ${r.setor}` : ""}
                    {r.funcao ? ` / ${r.funcao}` : ""}
                  </li>
                ))}
                {preview.rows.length > 5 && <li>… e mais {preview.rows.length - 5}</li>}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" className="bg-sgs-700 hover:bg-sgs-800" disabled={loading}>
              <Upload className="w-4 h-4" />
              {loading ? "Importando..." : "Importar colaboradores"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/colaboradores")}>
              Voltar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
