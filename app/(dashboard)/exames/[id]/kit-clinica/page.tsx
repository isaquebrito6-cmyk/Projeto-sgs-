import Link from "next/link";
import { notFound } from "next/navigation";
import { getSolicitacao } from "@/app/actions/exames";
import { PrintButton } from "@/components/print-button";
import { CHECKLIST_ANAMNESE, CHECKLIST_PSICOSSOCIAL } from "@/lib/checklists-medicina";
import { formatCPF, formatCNPJ, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function KitClinicaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sol = await getSolicitacao(id);
  if (!sol) notFound();

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8 print:p-4">
      <style>{`@media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; } .break-page { break-before: page; } }`}</style>

      <div className="no-print mb-6 flex flex-wrap gap-3">
        <PrintButton label="Imprimir kit completo" />
        <Link
          href={`/exames/${id}`}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Voltar
        </Link>
      </div>

      <div className="max-w-3xl mx-auto space-y-10">
        {/* 1. Solicitação */}
        <section className="border-2 border-slate-800">
          <div className="bg-slate-800 text-white px-5 py-3 text-center">
            <h1 className="text-lg font-bold">SOLICITAÇÃO DE EXAME OCUPACIONAL</h1>
            <p className="text-xs opacity-90">NR-7 — Ministério do Trabalho e Emprego · Envio à clínica</p>
          </div>
          <div className="p-5 space-y-3 text-sm">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Empresa</p>
                <p className="font-medium">{sol.empresa.razaoSocial}</p>
                <p>CNPJ {formatCNPJ(sol.empresa.cnpj)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Clínica destinatória</p>
                <p className="font-medium">
                  {sol.clinica
                    ? sol.clinica.nomeFantasia || sol.clinica.razaoSocial
                    : "A definir"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Trabalhador</p>
                <p className="font-medium">{sol.colaborador.nome}</p>
                <p>CPF {formatCPF(sol.colaborador.cpf)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Função / setor</p>
                <p className="font-medium">
                  {sol.colaborador.funcao?.nome || "—"}
                  {sol.colaborador.setor ? ` · ${sol.colaborador.setor.nome}` : ""}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Tipo de exame (NR-7)</p>
                <p className="font-bold text-base">{sol.tipoExame}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Data da solicitação</p>
                <p className="font-medium">{formatDate(sol.dataSolicitacao)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Riscos ocupacionais (PGR / PCMSO)</p>
              <p className="mt-1 whitespace-pre-wrap border rounded p-2 bg-slate-50">
                {sol.riscosInformados ||
                  "Não informados — preencher conforme inventário de riscos do PGR."}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Exames solicitados</p>
              <p className="mt-1 font-medium">
                {sol.examesSolicitados || "Exame clínico ocupacional"}
              </p>
            </div>
            {sol.observacoes && (
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Observações da empresa</p>
                <p className="mt-1">{sol.observacoes}</p>
              </div>
            )}
            <p className="text-[10px] text-slate-400 pt-2 border-t">
              Documento gerado pelo SGS para encaminhamento à clínica ocupacional.
            </p>
          </div>
        </section>

        {/* 2. Anamnese */}
        <section className="border-2 border-slate-800 break-page">
          <div className="bg-emerald-800 text-white px-5 py-3 text-center">
            <h2 className="text-lg font-bold">CHECKLIST DE ANAMNESE OCUPACIONAL</h2>
            <p className="text-xs opacity-90">
              Preenchimento pelo trabalhador e/ou entrevista clínica · {sol.colaborador.nome}
            </p>
          </div>
          <div className="p-5">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 text-left">
                  <th className="py-2 pr-2">Pergunta</th>
                  <th className="py-2 w-16 text-center">Sim</th>
                  <th className="py-2 w-16 text-center">Não</th>
                  <th className="py-2 w-40">Observação</th>
                </tr>
              </thead>
              <tbody>
                {CHECKLIST_ANAMNESE.map((item) => (
                  <tr key={item.id} className="border-b border-slate-200">
                    <td className="py-2.5 pr-2 align-top">{item.pergunta}</td>
                    <td className="py-2.5 text-center align-top">
                      {item.tipo === "sim_nao" ? "☐" : ""}
                    </td>
                    <td className="py-2.5 text-center align-top">
                      {item.tipo === "sim_nao" ? "☐" : ""}
                    </td>
                    <td className="py-2.5 align-top">
                      <div className="border-b border-dotted border-slate-400 min-h-[1.25rem]" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-8 grid sm:grid-cols-2 gap-8 text-center text-xs">
              <div>
                <div className="border-b border-slate-500 h-10 mb-1" />
                Assinatura do trabalhador
              </div>
              <div>
                <div className="border-b border-slate-500 h-10 mb-1" />
                Data
              </div>
            </div>
          </div>
        </section>

        {/* 3. Psicossocial */}
        <section className="border-2 border-slate-800 break-page">
          <div className="bg-indigo-900 text-white px-5 py-3 text-center">
            <h2 className="text-lg font-bold">CHECKLIST PSICOSSOCIAL / COMPORTAMENTAL</h2>
            <p className="text-xs opacity-90">
              Apoio à avaliação de fatores psicossociais · confidencial · {sol.colaborador.nome}
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs text-slate-600 mb-3">
              As respostas auxiliam o médico do trabalho. Dados de saúde são de acesso restrito.
            </p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 text-left">
                  <th className="py-2 pr-2">Pergunta</th>
                  <th className="py-2 w-16 text-center">Sim</th>
                  <th className="py-2 w-16 text-center">Não</th>
                  <th className="py-2 w-40">Observação</th>
                </tr>
              </thead>
              <tbody>
                {CHECKLIST_PSICOSSOCIAL.map((item) => (
                  <tr key={item.id} className="border-b border-slate-200">
                    <td className="py-2.5 pr-2 align-top">{item.pergunta}</td>
                    <td className="py-2.5 text-center align-top">
                      {item.tipo === "sim_nao" ? "☐" : ""}
                    </td>
                    <td className="py-2.5 text-center align-top">
                      {item.tipo === "sim_nao" ? "☐" : ""}
                    </td>
                    <td className="py-2.5 align-top">
                      <div className="border-b border-dotted border-slate-400 min-h-[1.25rem]" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-8 grid sm:grid-cols-2 gap-8 text-center text-xs">
              <div>
                <div className="border-b border-slate-500 h-10 mb-1" />
                Assinatura do trabalhador
              </div>
              <div>
                <div className="border-b border-slate-500 h-10 mb-1" />
                Profissional de saúde / data
              </div>
            </div>
          </div>
        </section>

        {/* 4. ASO em branco se ainda não emitido */}
        {!sol.aso && (
          <section className="border-2 border-dashed border-slate-400 break-page p-5 text-sm">
            <h2 className="font-bold text-center text-base mb-2">ASO — ATESTADO DE SAÚDE OCUPACIONAL</h2>
            <p className="text-center text-xs text-slate-500 mb-4">
              Modelo de referência NR-7 item 7.5.19.1 — preencher e emitir no sistema após o exame
            </p>
            <p className="text-slate-600">
              Após a avaliação clínica e os checklists, a clínica deve emitir o ASO no SGS
              (Exames → esta solicitação → Emitir ASO), com conclusão APTO/INAPTO, riscos do PGR,
              exames realizados e identificação do médico.
            </p>
            <p className="mt-4 text-xs">
              Trabalhador: <strong>{sol.colaborador.nome}</strong> · Tipo:{" "}
              <strong>{sol.tipoExame}</strong>
            </p>
          </section>
        )}

        {sol.aso && (
          <p className="text-center text-sm text-emerald-800 no-print">
            ASO já emitido.{" "}
            <Link href={`/exames/${id}/aso`} className="underline font-medium">
              Abrir ASO para impressão
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
