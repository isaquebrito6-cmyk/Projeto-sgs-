import Link from "next/link";
import { notFound } from "next/navigation";
import { getTreinamento } from "@/app/actions/treinamentos";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/print-button";
import { formatDate, formatCPF } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Cores oficiais orientativas da NR-26 (sinalização de segurança) */
const NR26 = {
  vermelho: "#C62828",
  amarelo: "#F9A825",
  verde: "#2E7D32",
  azul: "#1565C0",
  preto: "#1A1714",
};

export default async function CertificadosTreinamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTreinamento(id);
  if (!t) notFound();

  const presentes = t.participantes.filter((p) => p.presente);
  const lista = presentes.length > 0 ? presentes : t.participantes;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Certificados de capacitação</h1>
          <p className="text-sm text-slate-500">
            Layout com cores da NR-26 · conteúdo mínimo NR-1 item 1.7.1.1
          </p>
        </div>
        <div className="flex gap-2">
          <PrintButton label="Imprimir / PDF" />
          <Link href={`/treinamentos/${id}`}>
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>
      </div>

      {/* Legenda NR-26 */}
      <div className="print:hidden flex flex-wrap gap-3 text-[11px]">
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ background: NR26.vermelho }} /> Vermelho — proibição / combate a incêndio
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ background: NR26.amarelo }} /> Amarelo — atenção
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ background: NR26.verde }} /> Verde — segurança / emergência
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ background: NR26.azul }} /> Azul — obrigação
        </span>
      </div>

      {lista.length === 0 ? (
        <p className="text-sm text-slate-600">Inclua participantes no treinamento para gerar certificados.</p>
      ) : (
        <div className="space-y-10">
          {lista.map((p) => (
            <article
              key={p.id}
              className="break-inside-avoid relative overflow-hidden rounded-xl bg-white shadow-sm print:shadow-none"
              style={{ border: `3px solid ${NR26.verde}` }}
            >
              {/* Faixa superior NR-26 */}
              <div className="flex h-2">
                <div className="flex-1" style={{ background: NR26.vermelho }} />
                <div className="flex-1" style={{ background: NR26.amarelo }} />
                <div className="flex-1" style={{ background: NR26.verde }} />
                <div className="flex-1" style={{ background: NR26.azul }} />
              </div>

              <div className="p-6 md:p-8">
                <header className="text-center pb-4 mb-4" style={{ borderBottom: `2px solid ${NR26.verde}` }}>
                  <p
                    className="text-[10px] uppercase tracking-[0.2em] font-semibold"
                    style={{ color: NR26.azul }}
                  >
                    Certificado de Capacitação em SST
                  </p>
                  <h2 className="text-lg md:text-xl font-bold mt-1" style={{ color: NR26.preto }}>
                    {t.titulo}
                  </h2>
                  <p className="text-sm font-semibold mt-1" style={{ color: NR26.verde }}>
                    {t.tipo}
                  </p>
                </header>

                <p className="text-sm text-slate-700 leading-relaxed text-justify">
                  Certificamos que <strong>{p.colaborador.nome}</strong>, CPF{" "}
                  <strong>{formatCPF(p.colaborador.cpf)}</strong>
                  {p.colaborador.funcao ? (
                    <>
                      , função <strong>{p.colaborador.funcao.nome}</strong>
                    </>
                  ) : null}
                  , participou da capacitação abaixo, promovida por{" "}
                  <strong>{t.empresa.razaoSocial}</strong>
                  {t.empresa.cnpj ? <> (CNPJ {t.empresa.cnpj})</> : null}, em conformidade com as
                  Normas Regulamentadoras do Ministério do Trabalho e Emprego.
                </p>

                <div
                  className="mt-4 grid sm:grid-cols-2 gap-3 text-sm rounded-lg p-3"
                  style={{ background: "#F1F8E9", border: `1px solid ${NR26.verde}` }}
                >
                  <div>
                    <p className="text-[11px] uppercase tracking-wide" style={{ color: NR26.azul }}>
                      Carga horária
                    </p>
                    <p className="font-semibold">{t.cargaHoraria != null ? `${t.cargaHoraria} horas` : "—"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide" style={{ color: NR26.azul }}>
                      Data
                    </p>
                    <p className="font-semibold">{t.dataRealizacao ? formatDate(t.dataRealizacao) : "—"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide" style={{ color: NR26.azul }}>
                      Local
                    </p>
                    <p className="font-semibold">{t.local || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide" style={{ color: NR26.azul }}>
                      Validade / próximo periódico
                    </p>
                    <p className="font-semibold">
                      {t.validade ? formatDate(t.validade) : "Conforme norma / empregador"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 text-sm">
                  <p className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: NR26.verde }}>
                    Conteúdo programático
                  </p>
                  <p className="mt-1 text-slate-800 whitespace-pre-wrap">{t.conteudo || "—"}</p>
                </div>

                <div className="mt-10 grid sm:grid-cols-2 gap-8 text-center text-sm">
                  <div>
                    <div className="mb-1 h-12" style={{ borderBottom: `1px solid ${NR26.preto}` }} />
                    <p className="font-medium">{p.colaborador.nome}</p>
                    <p className="text-xs text-slate-500">Assinatura do trabalhador (NR-1)</p>
                  </div>
                  <div>
                    <div className="mb-1 h-12" style={{ borderBottom: `1px solid ${NR26.preto}` }} />
                    <p className="font-medium">{t.instrutor || "Instrutor / Responsável técnico"}</p>
                    <p className="text-xs text-slate-500">Nome, qualificação e assinatura</p>
                  </div>
                </div>

                <p className="mt-6 text-[10px] text-slate-400 text-center">
                  Documento gerado pelo SGS · NR-1 (1.7.1.1) · Cores de sinalização conforme NR-26
                </p>
              </div>

              <div className="flex h-1.5">
                <div className="flex-1" style={{ background: NR26.azul }} />
                <div className="flex-1" style={{ background: NR26.verde }} />
                <div className="flex-1" style={{ background: NR26.amarelo }} />
                <div className="flex-1" style={{ background: NR26.vermelho }} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
