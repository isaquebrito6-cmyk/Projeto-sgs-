import Link from "next/link";
import { notFound } from "next/navigation";
import { getTreinamento } from "@/app/actions/treinamentos";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/print-button";
import { formatDate, formatCPF, formatCNPJ } from "@/lib/utils";
import { getCatalogoById } from "@/lib/nr-treinamentos";

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
  const catalogo = t.catalogoId ? getCatalogoById(t.catalogoId) : null;
  const conteudoProgramatico =
    t.conteudo?.trim() || catalogo?.conteudoProgramatico || "—";

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white">
      <style>{`
        @page {
          size: A4 landscape;
          margin: 10mm;
        }
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
          .cert-page {
            page-break-after: always;
            break-after: page;
            width: 100%;
            min-height: calc(100vh - 20mm);
            box-shadow: none !important;
            margin: 0 !important;
          }
          .cert-page:last-child { page-break-after: auto; break-after: auto; }
        }
      `}</style>

      <div className="no-print p-4 md:p-6 space-y-4 max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Certificados de capacitação</h1>
            <p className="text-sm text-slate-500">
              Formato <strong>paisagem A4</strong> · frente e verso · cores NR-26 · NR-1 item 1.7.1.1
            </p>
          </div>
          <div className="flex gap-2">
            <PrintButton label="Imprimir frente e verso" />
            <Link href={`/treinamentos/${id}`}>
              <Button variant="outline">Voltar</Button>
            </Link>
          </div>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Na impressão, use <strong>orientação paisagem</strong> e, se possível,{" "}
          <strong>frente e verso</strong> (folha única por participante: frente = dados do curso,
          verso = conteúdo programático).
        </div>
        <div className="flex flex-wrap gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm" style={{ background: NR26.vermelho }} /> Vermelho
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm" style={{ background: NR26.amarelo }} /> Amarelo
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm" style={{ background: NR26.verde }} /> Verde
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm" style={{ background: NR26.azul }} /> Azul
          </span>
        </div>
      </div>

      {lista.length === 0 ? (
        <p className="text-sm text-slate-600 p-6 text-center">
          Inclua participantes no treinamento para gerar certificados.
        </p>
      ) : (
        <div className="space-y-8 print:space-y-0 pb-10">
          {lista.map((p) => (
            <div key={p.id} className="space-y-6 print:space-y-0">
              {/* ========== FRENTE — dados do curso ========== */}
              <article
                className="cert-page relative mx-auto max-w-[297mm] overflow-hidden rounded-xl bg-white shadow-md print:shadow-none print:rounded-none print:max-w-none"
                style={{ border: `3px solid ${NR26.verde}` }}
              >
                <div className="flex h-2.5">
                  <div className="flex-1" style={{ background: NR26.vermelho }} />
                  <div className="flex-1" style={{ background: NR26.amarelo }} />
                  <div className="flex-1" style={{ background: NR26.verde }} />
                  <div className="flex-1" style={{ background: NR26.azul }} />
                </div>

                <div className="px-8 py-5 md:px-12 md:py-7">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <p
                      className="text-[10px] uppercase tracking-[0.25em] font-bold"
                      style={{ color: NR26.azul }}
                    >
                      Frente · Certificado de Capacitação em SST
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                      Paisagem · NR-26
                    </p>
                  </div>

                  <header className="text-center pb-4 mb-4" style={{ borderBottom: `2px solid ${NR26.verde}` }}>
                    <h2 className="text-xl md:text-2xl font-bold leading-tight" style={{ color: NR26.preto }}>
                      {t.titulo}
                    </h2>
                    <p className="text-sm font-semibold mt-1" style={{ color: NR26.verde }}>
                      {t.tipo}
                      {catalogo?.norma ? ` · ${catalogo.norma}` : ""}
                    </p>
                  </header>

                  <p className="text-sm md:text-[15px] text-slate-700 leading-relaxed text-center max-w-3xl mx-auto">
                    Certificamos que <strong>{p.colaborador.nome}</strong>, CPF{" "}
                    <strong>{formatCPF(p.colaborador.cpf)}</strong>
                    {p.colaborador.funcao ? (
                      <>
                        , função <strong>{p.colaborador.funcao.nome}</strong>
                      </>
                    ) : null}
                    , participou com aproveitamento da capacitação abaixo, promovida por{" "}
                    <strong>{t.empresa.razaoSocial}</strong>
                    {t.empresa.cnpj ? <> — CNPJ {formatCNPJ(t.empresa.cnpj)}</> : null}, em
                    conformidade com as Normas Regulamentadoras do Ministério do Trabalho e Emprego.
                  </p>

                  <div
                    className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm rounded-lg p-4"
                    style={{ background: "#F1F8E9", border: `1px solid ${NR26.verde}` }}
                  >
                    <div>
                      <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: NR26.azul }}>
                        Carga horária
                      </p>
                      <p className="font-bold text-slate-900">
                        {t.cargaHoraria != null ? `${t.cargaHoraria} horas` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: NR26.azul }}>
                        Data de realização
                      </p>
                      <p className="font-bold text-slate-900">
                        {t.dataRealizacao ? formatDate(t.dataRealizacao) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: NR26.azul }}>
                        Local
                      </p>
                      <p className="font-bold text-slate-900">{t.local || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: NR26.azul }}>
                        Validade / próximo periódico
                      </p>
                      <p className="font-bold text-slate-900">
                        {t.validade ? formatDate(t.validade) : "Conforme norma / empregador"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-12 text-center text-sm max-w-2xl mx-auto">
                    <div>
                      <div className="mb-1 h-14" style={{ borderBottom: `1px solid ${NR26.preto}` }} />
                      <p className="font-medium">{p.colaborador.nome}</p>
                      <p className="text-xs text-slate-500">Assinatura do trabalhador (NR-1)</p>
                    </div>
                    <div>
                      <div className="mb-1 h-14" style={{ borderBottom: `1px solid ${NR26.preto}` }} />
                      <p className="font-medium">{t.instrutor || "Instrutor / Responsável técnico"}</p>
                      <p className="text-xs text-slate-500">Nome, qualificação e assinatura</p>
                    </div>
                  </div>

                  <p className="mt-5 text-[10px] text-slate-400 text-center">
                    SGS · Frente do certificado · Conteúdo programático no verso
                  </p>
                </div>

                <div className="flex h-1.5">
                  <div className="flex-1" style={{ background: NR26.azul }} />
                  <div className="flex-1" style={{ background: NR26.verde }} />
                  <div className="flex-1" style={{ background: NR26.amarelo }} />
                  <div className="flex-1" style={{ background: NR26.vermelho }} />
                </div>
              </article>

              {/* ========== VERSO — conteúdo programático ========== */}
              <article
                className="cert-page relative mx-auto max-w-[297mm] overflow-hidden rounded-xl bg-white shadow-md print:shadow-none print:rounded-none print:max-w-none"
                style={{ border: `3px solid ${NR26.azul}` }}
              >
                <div className="flex h-2.5">
                  <div className="flex-1" style={{ background: NR26.azul }} />
                  <div className="flex-1" style={{ background: NR26.verde }} />
                  <div className="flex-1" style={{ background: NR26.amarelo }} />
                  <div className="flex-1" style={{ background: NR26.vermelho }} />
                </div>

                <div className="px-8 py-5 md:px-12 md:py-7">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <p
                      className="text-[10px] uppercase tracking-[0.25em] font-bold"
                      style={{ color: NR26.azul }}
                    >
                      Verso · Conteúdo programático
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {p.colaborador.nome} · {t.tipo}
                    </p>
                  </div>

                  <header className="pb-3 mb-4" style={{ borderBottom: `2px solid ${NR26.azul}` }}>
                    <h3 className="text-lg font-bold" style={{ color: NR26.preto }}>
                      {t.titulo}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Capacitação registrada conforme NR-1 (item 1.7.1.1, alínea relativa ao conteúdo)
                    </p>
                  </header>

                  <div
                    className="rounded-lg p-5 min-h-[180px]"
                    style={{ background: "#E3F2FD", border: `1px solid ${NR26.azul}` }}
                  >
                    <p
                      className="text-[11px] uppercase tracking-wide font-bold mb-2"
                      style={{ color: NR26.azul }}
                    >
                      Ementa / conteúdo programático ministrado
                    </p>
                    <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                      {conteudoProgramatico}
                    </p>
                  </div>

                  <div className="mt-5 grid md:grid-cols-3 gap-4 text-sm">
                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="text-[10px] uppercase text-slate-500">Carga horária</p>
                      <p className="font-semibold">
                        {t.cargaHoraria != null ? `${t.cargaHoraria} h` : "—"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="text-[10px] uppercase text-slate-500">Data</p>
                      <p className="font-semibold">
                        {t.dataRealizacao ? formatDate(t.dataRealizacao) : "—"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="text-[10px] uppercase text-slate-500">Instrutor</p>
                      <p className="font-semibold">{t.instrutor || "—"}</p>
                    </div>
                  </div>

                  {catalogo?.observacao && (
                    <p className="mt-4 text-xs text-slate-500 italic">
                      Observação normativa: {catalogo.observacao}
                    </p>
                  )}

                  <div className="mt-8 grid grid-cols-2 gap-12 text-center text-sm max-w-2xl mx-auto">
                    <div>
                      <div className="mb-1 h-12" style={{ borderBottom: `1px solid ${NR26.preto}` }} />
                      <p className="text-xs text-slate-500">Assinatura do trabalhador</p>
                    </div>
                    <div>
                      <div className="mb-1 h-12" style={{ borderBottom: `1px solid ${NR26.preto}` }} />
                      <p className="text-xs text-slate-500">Instrutor / responsável técnico</p>
                    </div>
                  </div>

                  <p className="mt-5 text-[10px] text-slate-400 text-center">
                    SGS · Verso do certificado · Documento interno de capacitação (NR-1 / NR-26)
                  </p>
                </div>

                <div className="flex h-1.5">
                  <div className="flex-1" style={{ background: NR26.vermelho }} />
                  <div className="flex-1" style={{ background: NR26.amarelo }} />
                  <div className="flex-1" style={{ background: NR26.verde }} />
                  <div className="flex-1" style={{ background: NR26.azul }} />
                </div>
              </article>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
