"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/print-button";
import { Eraser, PenLine } from "lucide-react";

export type CarteirinhaData = {
  id: string;
  nome: string;
  cpfFormatado: string;
  fotoUrl: string | null;
  empresa: string;
  funcao: string | null;
  setor: string | null;
  admissao: string | null;
};

export function CarteirinhaView({ data }: { data: CarteirinhaData }) {
  const [mostrarAssinatura, setMostrarAssinatura] = useState(false);
  const [assinaturaUrl, setAssinaturaUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const desenhando = useRef(false);
  const [temTraço, setTemTraço] = useState(false);

  useEffect(() => {
    if (!mostrarAssinatura) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Ajusta resolução para tela retina
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1a1714";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, [mostrarAssinatura]);

  function pos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const t = e.touches[0] || e.changedTouches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function iniciar(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    desenhando.current = true;
    const p = pos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function mover(e: React.MouseEvent | React.TouchEvent) {
    if (!desenhando.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const p = pos(e, canvas);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    setTemTraço(true);
  }

  function parar() {
    desenhando.current = false;
  }

  function limpar() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    setTemTraço(false);
    setAssinaturaUrl(null);
  }

  function aplicarAssinatura() {
    const canvas = canvasRef.current;
    if (!canvas || !temTraço) return;
    setAssinaturaUrl(canvas.toDataURL("image/png"));
  }

  function removerAssinatura() {
    setAssinaturaUrl(null);
    setMostrarAssinatura(false);
    setTemTraço(false);
  }

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div className="flex flex-wrap justify-between gap-2 print:hidden">
        <Link href={`/colaboradores/${data.id}`}>
          <Button variant="outline">Voltar</Button>
        </Link>
        <div className="flex flex-wrap gap-2">
          {!mostrarAssinatura && !assinaturaUrl && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setMostrarAssinatura(true)}
            >
              <PenLine className="w-4 h-4" />
              Assinatura digital
            </Button>
          )}
          {assinaturaUrl && (
            <Button type="button" variant="outline" onClick={removerAssinatura}>
              Remover assinatura
            </Button>
          )}
          <PrintButton label="Imprimir / PDF" />
        </div>
      </div>

      {/* Painel de assinatura — só aparece quando solicitado */}
      {mostrarAssinatura && !assinaturaUrl && (
        <div className="rounded-lg border border-sgs-200 bg-sgs-50 p-4 space-y-3 print:hidden">
          <p className="text-sm font-medium text-sgs-900">Assinatura digital do trabalhador</p>
          <p className="text-xs text-slate-500">
            Assine com o dedo (celular) ou mouse. O campo só aparece porque você solicitou.
          </p>
          <canvas
            ref={canvasRef}
            className="w-full h-36 rounded-md border bg-white touch-none cursor-crosshair"
            onMouseDown={iniciar}
            onMouseMove={mover}
            onMouseUp={parar}
            onMouseLeave={parar}
            onTouchStart={iniciar}
            onTouchMove={mover}
            onTouchEnd={parar}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={limpar}>
              <Eraser className="w-3.5 h-3.5" />
              Limpar
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-sgs-700 hover:bg-sgs-800"
              disabled={!temTraço}
              onClick={aplicarAssinatura}
            >
              Aplicar na carteirinha
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setMostrarAssinatura(false);
                setTemTraço(false);
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Cartão */}
      <div className="rounded-xl border-2 border-sgs-700 bg-white overflow-hidden shadow-sm">
        <div className="bg-sgs-800 text-white px-4 py-2 text-center">
          <p className="text-xs uppercase tracking-wide opacity-90">Identificação do trabalhador</p>
          <p className="font-semibold text-sm">{data.empresa}</p>
        </div>
        <div className="p-4 flex gap-4">
          <div className="w-24 h-32 rounded border bg-slate-100 overflow-hidden shrink-0">
            {data.fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.fotoUrl} alt={data.nome} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 p-1 text-center">
                Sem foto
              </div>
            )}
          </div>
          <div className="text-sm space-y-1 min-w-0">
            <p className="font-bold text-base leading-tight">{data.nome}</p>
            <p>
              <span className="text-slate-500">CPF:</span> {data.cpfFormatado}
            </p>
            {data.funcao && (
              <p>
                <span className="text-slate-500">Função:</span> {data.funcao}
              </p>
            )}
            {data.setor && (
              <p>
                <span className="text-slate-500">Setor:</span> {data.setor}
              </p>
            )}
            {data.admissao && (
              <p>
                <span className="text-slate-500">Admissão:</span> {data.admissao}
              </p>
            )}
          </div>
        </div>

        {assinaturaUrl && (
          <div className="border-t px-4 py-3">
            <p className="text-[10px] text-slate-500 mb-1">Assinatura do trabalhador</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assinaturaUrl}
              alt="Assinatura"
              className="h-12 max-w-full object-contain object-left"
            />
          </div>
        )}

        <div className="border-t px-4 py-2 text-[10px] text-slate-500 text-center">
          Documento de uso interno · SST / SGS · {new Date().toLocaleDateString("pt-BR")}
        </div>
      </div>

      <p className="text-xs text-slate-500 print:hidden text-center">
        Foto vem do cadastro. Assinatura digital só aparece se você clicar em “Assinatura digital”.
      </p>
    </div>
  );
}
