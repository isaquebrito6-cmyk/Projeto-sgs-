"use client";

import { useRef, useState } from "react";
import { Camera, ClipboardPaste, ImagePlus, Loader2, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extrairColaboradorDoTexto } from "@/lib/ocr-colaboradores";
import { formatCPFMask } from "@/lib/brasil";

export type DadosOcrColaborador = {
  nome?: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  setorNome?: string;
  funcaoNome?: string;
};

/**
 * Lê foto/scan/imagem colada de documento ou lista e devolve campos para o formulário.
 */
export function DocumentoOcrFill({
  onDados,
}: {
  onDados: (dados: DadosOcrColaborador) => void;
}) {
  const camRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");

  async function runOcr(file: File | Blob, origem: string) {
    setLoading(true);
    setErro("");
    setMsg("");
    setProgress(0);
    try {
      const Tesseract = (await import("tesseract.js")).default;
      const result = await Tesseract.recognize(file, "por", {
        logger: (m) => {
          if (m.status === "recognizing text" && typeof m.progress === "number") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      const raw = result.data.text || "";
      if (!raw.trim()) {
        setErro("Não li texto na imagem. Use foto mais nítida ou preencha manualmente.");
        return;
      }
      const extraido = extrairColaboradorDoTexto(raw);
      if (!extraido.nome && !extraido.cpf) {
        setErro("Texto lido, mas não achei Nome/CPF. Ajuste a foto ou digite os dados.");
        return;
      }
      onDados({
        nome: extraido.nome,
        cpf: extraido.cpf ? formatCPFMask(extraido.cpf) : undefined,
        email: extraido.email,
        telefone: extraido.telefone,
        setorNome: extraido.setor,
        funcaoNome: extraido.funcao,
      });
      setMsg(
        `Dados detectados (${origem}): ${[extraido.nome, extraido.cpf].filter(Boolean).join(" · ")}. Revise antes de salvar.`
      );
    } catch {
      setErro("Falha no OCR. Tente outra imagem ou preencha manualmente.");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }

  function onFile(file?: File) {
    if (!file || !file.type.startsWith("image/")) {
      setErro("Selecione uma imagem.");
      return;
    }
    void runOcr(file, file.name);
  }

  async function colar() {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find((t) => t.startsWith("image/"));
        if (!type) continue;
        const blob = await item.getType(type);
        await runOcr(blob, "colar");
        return;
      }
      setErro("Nenhuma imagem na área de transferência.");
    } catch {
      setErro("Não foi possível colar a imagem (permissão do navegador).");
    }
  }

  return (
    <div className="rounded-lg border border-dashed border-sgs-300 bg-sgs-50/60 p-3 space-y-2 sm:col-span-2">
      <div className="flex items-center gap-2 text-sm font-medium text-sgs-900">
        <ScanLine className="w-4 h-4" />
        Preencher por foto / scanner / colar
      </div>
      <p className="text-xs text-slate-500">
        Tire foto ou envie scan de documento/lista. O sistema tenta colocar Nome, CPF e outros campos
        automaticamente — sempre revise.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={() => camRef.current?.click()}
        >
          <Camera className="w-3.5 h-3.5" />
          Câmera / scanner
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={() => fileRef.current?.click()}
        >
          <ImagePlus className="w-3.5 h-3.5" />
          Upload imagem
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={loading} onClick={colar}>
          <ClipboardPaste className="w-3.5 h-3.5" />
          Colar imagem
        </Button>
      </div>
      {loading && (
        <p className="text-xs text-sgs-800 flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" /> Lendo documento… {progress}%
        </p>
      )}
      {msg && <p className="text-xs text-emerald-700">{msg}</p>}
      {erro && <p className="text-xs text-red-600">{erro}</p>}
      <input
        ref={camRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </div>
  );
}
