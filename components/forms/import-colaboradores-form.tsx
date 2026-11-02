"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { importColaboradores } from "@/app/actions/import-colaboradores";
import { parseImportRows } from "@/lib/import-colaboradores";
import { textoOcrParaCsv } from "@/lib/ocr-colaboradores";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertCircle,
  Camera,
  ClipboardPaste,
  FileSpreadsheet,
  Loader2,
  Upload,
} from "lucide-react";

type EmpresaOption = { id: string; razaoSocial: string; nomeFantasia: string | null };
type Tab = "colar" | "arquivo" | "foto";

export function ImportColaboradoresForm({ empresas }: { empresas: EmpresaOption[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const imageFileRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<Tab>("colar");
  const [empresaId, setEmpresaId] = useState(empresas[0]?.id || "");
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
      setError("Informe a lista (colar, CSV ou foto com OCR).");
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

  function handleCsvFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      setTexto(String(reader.result || ""));
      setInfo(`Arquivo "${file.name}" carregado. Revise a pré-visualização e importe.`);
      setTab("colar");
    };
    reader.readAsText(file, "UTF-8");
  }

  async function runOcr(file: File | Blob, nomeOrigem = "imagem") {
    setError("");
    setInfo("");
    setOcrLoading(true);
    setOcrProgress(0);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      const Tesseract = (await import("tesseract.js")).default;
      const result = await Tesseract.recognize(file, "por", {
        logger: (m) => {
          if (m.status === "recognizing text" && typeof m.progress === "number") {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });

      const raw = result.data.text || "";
      if (!raw.trim()) {
        setError("Não foi possível ler texto na imagem. Tente foto mais nítida ou use colar/CSV.");
        return;
      }

      const estruturado = textoOcrParaCsv(raw);
      setTexto(estruturado);
      setInfo(
        `Texto extraído (${nomeOrigem}). Revise Nome/CPF na pré-visualização antes de importar — OCR pode errar letras.`
      );
      setTab("colar");
    } catch (err) {
      console.error("[ocr]", err);
      setError("Falha no OCR. Use uma foto nítida ou cole a lista manualmente.");
    } finally {
      setOcrLoading(false);
      setOcrProgress(0);
    }
  }

  function onImageSelected(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Selecione uma imagem (foto ou scan).");
      return;
    }
    void runOcr(file, file.name);
  }

  async function colarImagemClipboard() {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find((t) => t.startsWith("image/"));
        if (!type) continue;
        const blob = await item.getType(type);
        await runOcr(blob, "colar");
        return;
      }
      setError("Nenhuma imagem na área de transferência.");
    } catch {
      setError("Não foi possível colar a imagem (permissão do navegador). Use upload ou câmera.");
    }
  }

  useEffect(() => {
    if (tab !== "foto") return;
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) void runOcr(file, "Ctrl+V");
          break;
        }
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const tabs: { id: Tab; label: string; icon: typeof ClipboardPaste }[] = [
    { id: "colar", label: "Colar texto", icon: ClipboardPaste },
    { id: "arquivo", label: "CSV", icon: FileSpreadsheet },
    { id: "foto", label: "Foto / Scanner", icon: Camera },
  ];

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

          {info && !error && (
            <div className="rounded-md border border-sgs-200 bg-sgs-50 px-3 py-2 text-sm text-sgs-900">
              {info}
            </div>
          )}

          {result && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 space-y-1">
              <p>
                <strong>{result.criados}</strong> criados ·{" "}
                <strong>{result.atualizados}</strong> atualizados
                {result.erros.length > 0 && (
                  <>
                    {" "}· <strong className="text-amber-800">{result.erros.length}</strong> com erro
                  </>
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

          <div className="flex rounded-lg border bg-slate-50 p-1 gap-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs sm:text-sm font-medium transition ${
                  tab === t.id
                    ? "bg-white text-sgs-800 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>

          {tab === "arquivo" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Arquivo CSV ou TXT</label>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt,text/csv,text/plain"
                onChange={(e) => e.target.files?.[0] && handleCsvFile(e.target.files[0])}
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-sgs-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-sgs-800"
              />
              <p className="text-xs text-slate-500">
                Cabeçalhos sugeridos: Nome;CPF;Setor;Função;E-mail;Telefone
              </p>
            </div>
          )}

          {tab === "foto" && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Foto ou scan da lista. O sistema lê o texto (OCR) e tenta preencher Nome, CPF, setor e
                função. Depois revise e importe.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={ocrLoading}
                  onClick={() => cameraRef.current?.click()}
                  className="flex-1"
                >
                  <Camera className="w-4 h-4" />
                  Câmera / scanner
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={ocrLoading}
                  onClick={() => imageFileRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4" />
                  Enviar imagem
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={ocrLoading}
                  onClick={colarImagemClipboard}
                  className="flex-1"
                >
                  <ClipboardPaste className="w-4 h-4" />
                  Colar imagem
                </Button>
              </div>
              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => onImageSelected(e.target.files?.[0])}
              />
              <input
                ref={imageFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onImageSelected(e.target.files?.[0])}
              />

              {ocrLoading && (
                <div className="flex items-center gap-2 text-sm text-sgs-800">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Lendo imagem… {ocrProgress}%
                </div>
              )}

              {previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Pré-visualização da lista"
                  className="max-h-48 rounded-md border object-contain bg-slate-50"
                />
              )}
            </div>
          )}

          {(tab === "colar" || texto.trim().length > 0) && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Lista (editar / revisar) *</label>
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                rows={10}
                placeholder={"Nome;CPF;Setor;Função\nMaria Silva;12345678909;Produção;Operador"}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          )}

          {preview && preview.rows.length > 0 && (
            <div className="rounded-md border bg-slate-50 p-3 text-xs text-slate-600">
              <p className="font-medium text-slate-800 mb-1">
                Pré-visualização: {preview.rows.length} linha(s)
              </p>
              {preview.avisos.map((a) => (
                <p key={a} className="text-amber-700">
                  {a}
                </p>
              ))}
              <ul className="mt-2 space-y-0.5 max-h-40 overflow-auto">
                {preview.rows.slice(0, 12).map((r, i) => (
                  <li key={i}>
                    <span className="font-medium text-slate-800">{r.nome || "(sem nome)"}</span>
                    {" — "}
                    {r.cpf || "(sem CPF)"}
                    {r.setor ? ` · ${r.setor}` : ""}
                    {r.funcao ? ` / ${r.funcao}` : ""}
                  </li>
                ))}
                {preview.rows.length > 12 && <li>… e mais {preview.rows.length - 12}</li>}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              className="bg-sgs-700 hover:bg-sgs-800"
              disabled={loading || ocrLoading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Importando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Importar colaboradores
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/colaboradores")}
              disabled={loading}
            >
              Voltar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
