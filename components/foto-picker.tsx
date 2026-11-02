"use client";

import { useRef, useState } from "react";
import { Camera, ClipboardPaste, ImagePlus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clipboardImageToDataUrl, fileToCompressedDataUrl } from "@/lib/image-compress";

export function FotoPicker({
  value,
  onChange,
  label = "Foto de identificação (carteirinha)",
}: {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  label?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function fromFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) {
      setMsg("Selecione uma imagem.");
      return;
    }
    setLoading(true);
    setMsg("");
    try {
      const url = await fileToCompressedDataUrl(file);
      onChange(url);
      setMsg("Foto pronta (comprimida)." );
    } catch {
      setMsg("Não foi possível processar a imagem.");
    } finally {
      setLoading(false);
    }
  }

  async function fromClipboard() {
    setLoading(true);
    setMsg("");
    try {
      const url = await clipboardImageToDataUrl();
      if (!url) {
        setMsg("Nenhuma imagem na área de transferência. Copie a foto e tente de novo.");
        return;
      }
      onChange(url);
      setMsg("Foto colada da área de transferência.");
    } catch {
      setMsg("Permissão de colar imagem negada pelo navegador.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2 sm:col-span-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="w-28 h-36 rounded-md border bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Foto" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-slate-400 text-center px-2">Sem foto</span>
          )}
        </div>
        <div className="flex flex-col gap-2 flex-1 w-full">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={loading}
              onClick={() => camRef.current?.click()}
            >
              <Camera className="w-3.5 h-3.5" />
              Câmera / scan
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={loading}
              onClick={() => fileRef.current?.click()}
            >
              <ImagePlus className="w-3.5 h-3.5" />
              Upload
            </Button>
            <Button type="button" size="sm" variant="outline" disabled={loading} onClick={fromClipboard}>
              <ClipboardPaste className="w-3.5 h-3.5" />
              Colar
            </Button>
            {value && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={loading}
                onClick={() => {
                  onChange(undefined);
                  setMsg("");
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remover
              </Button>
            )}
          </div>
          {loading && (
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Processando…
            </p>
          )}
          {msg && <p className="text-xs text-slate-500">{msg}</p>}
          <p className="text-xs text-slate-400">
            A foto é comprimida no celular/computador antes de salvar (não sobe arquivo pesado).
          </p>
        </div>
      </div>
      <input
        ref={camRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => fromFile(e.target.files?.[0])}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => fromFile(e.target.files?.[0])}
      />
    </div>
  );
}
