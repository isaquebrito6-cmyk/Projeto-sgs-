import Link from "next/link";
import { notFound } from "next/navigation";
import { getTreinamento } from "@/app/actions/treinamentos";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/print-button";
import { formatDate, formatCPF } from "@/lib/utils";

export const dynamic = "force-dynamic";

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
          <p className="text-sm text-slate-500">Conforme NR-1, item 1.7.1.1 — imprima ou salve em PDF</p>
        </div>
        <div className="flex gap-2">
          <PrintButton />
          <Link href={`/treinamentos/${id}`}>
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>
      </div>

      {lista.length === 0 ? (
        <p className="text-sm text-slate-600">Inclua participantes no treinamento para gerar certificados.</p>
      ) : (
        <div className="space-y-8">
          {lista.map((p) => (
            <article
              key={p.id}
              className="break-inside-avoid rounded-lg border-2 border-slate-800 bg-white p-6 md:p-8 print:border print:shadow-none"
            >
              <header className="text-center border-b border-slate-200 pb-4 mb-4">
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  Certificado de Capacitação em SST
                </p>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{t.titulo}</h2>
                <p className="text-sm text-sgs-800 font-medium">{t.tipo}</p>
              </header>

              <p className="text-sm text-slate-700 leading-relaxed">
                Certificamos que <strong>{p.colaborador.nome}</strong>, CPF{" "}
                <strong>{formatCPF(p.colaborador.cpf)}</strong>
                {p.colaborador.funcao ? (
                  <>
                    , função <strong>{p.colaborador.funcao.nome}</strong>
                  </>
                ) : null}
                , participou da capacitação abaixo, promovida por{" "}
                <strong>{t.empresa.razaoSocial}</strong>
                {t.empresa.cnpj ? <> (CNPJ {t.empresa.cnpj})</> : null}.
              </p>

              <dl className="mt-4 grid sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-slate-500">Carga horária</dt>
                  <dd className="font-medium">{t.cargaHoraria != null ? `${t.cargaHoraria} horas` : "—"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Data</dt>
                  <dd className="font-medium">{t.dataRealizacao ? formatDate(t.dataRealizacao) : "—"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Local</dt>
                  <dd className="font-medium">{t.local || "—"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Validade / próximo periódico</dt>
                  <dd className="font-medium">{t.validade ? formatDate(t.validade) : "Conforme norma / empregador"}</dd>
                </div>
              </dl>

              <div className="mt-4 text-sm">
                <p className="text-slate-500">Conteúdo programático</p>
                <p className="mt-1 text-slate-800 whitespace-pre-wrap">{t.conteudo || "—"}</p>
              </div>

              <div className="mt-10 grid sm:grid-cols-2 gap-8 text-center text-sm">
                <div>
                  <div className="border-b border-slate-400 mb-1 h-10" />
                  <p className="font-medium">{p.colaborador.nome}</p>
                  <p className="text-xs text-slate-500">Assinatura do trabalhador (NR-1)</p>
                </div>
                <div>
                  <div className="border-b border-slate-400 mb-1 h-10" />
                  <p className="font-medium">{t.instrutor || "Instrutor / Responsável técnico"}</p>
                  <p className="text-xs text-slate-500">Nome, qualificação e assinatura</p>
                </div>
              </div>

              <p className="mt-6 text-[10px] text-slate-400 text-center">
                Documento gerado pelo SGS com base no conteúdo mínimo do certificado previsto na NR-1
                (item 1.7.1.1). A capacitação deve observar a NR específica aplicável.
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
