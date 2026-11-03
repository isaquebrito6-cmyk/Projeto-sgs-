"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/print-button";
import { Eraser, PenLine } from "lucide-react";

/** Cores NR-26 */
const NR26 = {
  vermelho: "#C62828",
  amarelo: "#F9A825",
  verde: "#2E7D32",
  azul: "#1565C0",
  preto: "#1A1714",
};

export type CarteirinhaData = {
  id: string;
  nome: string;
  cpfFormatado: string;
  fotoUrl: string | null;
  empresa: string;
  cnpj?: string;
  funcao: string | null;
  setor: string | null;
  admissao: string | null;
  nrs: { nr: string; validadeLabel: string | null; vencido: boolean }[];
  maquinas: string[];
  aso: {
    conclusao: string;
    validadeLabel: string;
    emissaoLabel: string;
    vencido: boolean;
  } | null;
};

function NrChip({ nr, validadeLabel, vencido }: { nr: string; validadeLabel: string | null; vencido: boolean }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg text-white shadow-sm min-w-[3.25rem] px-1.5 py-1"
      style={{
        background: vencido ? NR26.vermelho : NR26.azul,
        border: `2px solid ${vencido ? NR26.vermelho : NR26.amarelo}`,
      }}
      title={validadeLabel ? `Validade: ${validadeLabel}` : `NR-${nr}`}
    >
      <span className="text-[9px] font-bold leading-none tracking-wide opacity-90">NR</span>
      <span className="text-base font-extrabold leading-tight">{parseInt(nr, 10)}</span>
      {validadeLabel && (
        <span className="text-[8px] font-semibold leading-none mt-0.5 opacity-95">{validadeLabel}</span>
      )}
    </div>
  );
}

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
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = NR26.preto;
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
    <div className="space-y-4 max-w-md mx-auto">
      <div className="flex flex-wrap justify-between gap-2 print:hidden">
        <Link href={`/colaboradores/${data.id}`}>
          <Button variant="outline">Voltar</Button>
        </Link>
        <div className="flex flex-wrap gap-2">
          {!mostrarAssinatura && !assinaturaUrl && (
            <Button type="button" variant="outline" onClick={() => setMostrarAssinatura(true)}>
              <PenLine className="w-4 h-4" />
              Assinatura
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

      {mostrarAssinatura && !assinaturaUrl && (
        <div className="rounded-lg border border-sgs-200 bg-sgs-50 p-4 space-y-3 print:hidden">
          <p className="text-sm font-medium">Assinatura digital do trabalhador</p>
          <canvas
            ref={canvasRef}
            className="w-full h-32 rounded-md border bg-white touch-none cursor-crosshair"
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
              Aplicar
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

      {/* ——— CARTEIRINHA ——— */}
      <div
        className="rounded-2xl overflow-hidden shadow-lg bg-white print:shadow-none"
        style={{ border: `3px solid ${NR26.verde}` }}
      >
        {/* Faixa NR-26 */}
        <div className="flex h-2">
          <div className="flex-1" style={{ background: NR26.vermelho }} />
          <div className="flex-1" style={{ background: NR26.amarelo }} />
          <div className="flex-1" style={{ background: NR26.verde }} />
          <div className="flex-1" style={{ background: NR26.azul }} />
        </div>

        <div className="px-4 py-2 text-center text-white" style={{ background: NR26.verde }}>
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold opacity-90">
            Carteirinha de identificação SST
          </p>
          <p className="font-bold text-sm leading-tight">{data.empresa}</p>
          {data.cnpj && <p className="text-[10px] opacity-80">CNPJ {data.cnpj}</p>}
        </div>

        <div className="p-4 flex gap-3">
          <div
            className="w-[5.5rem] h-[7rem] rounded-lg overflow-hidden shrink-0 bg-slate-100"
            style={{ border: `2px solid ${NR26.amarelo}` }}
          >
            {data.fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.fotoUrl} alt={data.nome} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 p-1 text-center">
                Sem foto
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1 text-sm">
            <p className="font-extrabold text-base leading-tight" style={{ color: NR26.preto }}>
              {data.nome}
            </p>
            <p className="text-xs">
              <span className="text-slate-500">CPF</span>{" "}
              <span className="font-semibold">{data.cpfFormatado}</span>
            </p>
            <p className="text-xs">
              <span className="text-slate-500">Função</span>{" "}
              <span className="font-bold" style={{ color: NR26.azul }}>
                {data.funcao || "—"}
              </span>
            </p>
            {data.setor && (
              <p className="text-xs">
                <span className="text-slate-500">Setor</span> <span className="font-medium">{data.setor}</span>
              </p>
            )}
            {data.admissao && (
              <p className="text-xs">
                <span className="text-slate-500">Admissão</span> {data.admissao}
              </p>
            )}
          </div>
        </div>

        {/* Máquinas / aptidões */}
        {data.maquinas.length > 0 && (
          <div className="px-4 pb-3">
            <p
              className="text-[10px] font-bold uppercase tracking-wide mb-1"
              style={{ color: NR26.verde }}
            >
              Apto a operar
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.maquinas.map((m) => (
                <span
                  key={m}
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-white"
                  style={{ background: NR26.verde }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Chips NR */}
        <div className="px-4 pb-3">
          <p
            className="text-[10px] font-bold uppercase tracking-wide mb-1.5"
            style={{ color: NR26.azul }}
          >
            Treinamentos (NR)
          </p>
          {data.nrs.length === 0 ? (
            <p className="text-[11px] text-slate-400">Nenhum treinamento NR registrado para este colaborador.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.nrs.map((n) => (
                <NrChip
                  key={n.nr}
                  nr={n.nr}
                  validadeLabel={n.validadeLabel}
                  vencido={n.vencido}
                />
              ))}
            </div>
          )}
        </div>

        {/* Chip ASO */}
        <div className="px-4 pb-4">
          <p
            className="text-[10px] font-bold uppercase tracking-wide mb-1.5"
            style={{ color: NR26.vermelho }}
          >
            ASO — Atestado de Saúde Ocupacional
          </p>
          {data.aso ? (
            <div
              className="rounded-xl px-3 py-2.5 text-white"
              style={{
                background: data.aso.vencido ? NR26.vermelho : NR26.verde,
                border: `2px solid ${NR26.amarelo}`,
              }}
            >
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase opacity-90 font-semibold">Validade</p>
                  <p className="text-2xl font-extrabold leading-none tracking-tight">
                    {data.aso.validadeLabel}
                  </p>
                  <p className="text-[10px] mt-1 opacity-90">
                    Emissão {data.aso.emissaoLabel} · {data.aso.conclusao}
                  </p>
                </div>
                <div
                  className="rounded-md px-2 py-1 text-center shrink-0"
                  style={{ background: "rgba(0,0,0,0.2)" }}
                >
                  <p className="text-[9px] font-bold leading-none">ASO</p>
                  <p className="text-xs font-extrabold leading-tight">
                    {data.aso.vencido ? "VENC" : "OK"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="rounded-xl px-3 py-2 text-sm border-2 border-dashed"
              style={{ borderColor: NR26.vermelho, color: NR26.vermelho }}
            >
              Sem ASO cadastrado
            </div>
          )}
          <p className="text-[9px] text-slate-400 mt-1">
            Validade do ASO estimada em 12 meses a partir da emissão (ajuste conforme PCMSO / grau de
            risco).
          </p>
        </div>

        {assinaturaUrl && (
          <div className="px-4 pb-3 border-t pt-2">
            <p className="text-[10px] text-slate-500 mb-1">Assinatura do trabalhador</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assinaturaUrl}
              alt="Assinatura"
              className="h-10 max-w-full object-contain object-left"
            />
          </div>
        )}

        <div className="flex h-1.5">
          <div className="flex-1" style={{ background: NR26.azul }} />
          <div className="flex-1" style={{ background: NR26.verde }} />
          <div className="flex-1" style={{ background: NR26.amarelo }} />
          <div className="flex-1" style={{ background: NR26.vermelho }} />
        </div>
        <p className="text-[9px] text-center text-slate-400 py-1.5 px-2">
          Uso interno · SGS · Cores NR-26 · {new Date().toLocaleDateString("pt-BR")}
        </p>
      </div>

      <p className="text-xs text-slate-500 print:hidden text-center">
        Chips de NR vêm dos treinamentos realizados. ASO vem do último exame. Cadastre treinamentos e
        ASO para preencher a carteirinha.
      </p>
    </div>
  );
}
