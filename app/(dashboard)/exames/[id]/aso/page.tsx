import Link from "next/link";
import { notFound } from "next/navigation";
import { getSolicitacao } from "@/app/actions/exames";
import { PrintButton } from "@/components/print-button";
import { formatCPF, formatCNPJ, formatDate } from "@/lib/utils";

export default async function ASOPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sol = await getSolicitacao(id);
  if (!sol?.aso) notFound();

  const aso = sol.aso;

  return (
    <div className="min-h-screen bg-white text-black p-8 print:p-6">
      <style>{`@media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`}</style>

      <div className="no-print mb-6 flex gap-3">
        <PrintButton />
        <Link href={`/exames/${id}`} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-slate-50">
          Voltar
        </Link>
      </div>

      <div className="max-w-3xl mx-auto border-2 border-slate-800">
        <div className="border-b-2 border-slate-800 bg-slate-100 px-6 py-4 text-center">
          <h1 className="text-xl font-bold tracking-wide">ATESTADO DE SAÚDE OCUPACIONAL — ASO</h1>
          <p className="text-sm mt-1">Norma Regulamentadora NR-7 — Ministério do Trabalho e Emprego</p>
          <p className="text-xs text-slate-600 mt-0.5">Item 7.5.19.1 — Conteúdo mínimo obrigatório</p>
        </div>

        <div className="px-6 py-5 space-y-5 text-sm">
          <section>
            <h2 className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b pb-1 mb-2">
              a) Identificação da organização
            </h2>
            <p><strong>Razão Social:</strong> {aso.razaoSocialEmpresa}</p>
            <p><strong>CNPJ:</strong> {formatCNPJ(aso.cnpjEmpresa)}</p>
          </section>

          <section>
            <h2 className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b pb-1 mb-2">
              b) Identificação do empregado
            </h2>
            <p><strong>Nome completo:</strong> {aso.nomeColaborador}</p>
            <p><strong>CPF:</strong> {formatCPF(aso.cpfColaborador)}</p>
            <p><strong>Função:</strong> {aso.funcaoColaborador || "—"}</p>
          </section>

          <section>
            <h2 className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b pb-1 mb-2">
              c) Perigos ou fatores de risco do PGR que necessitam de controle médico (PCMSO)
            </h2>
            <p className="whitespace-pre-wrap">
              {aso.riscosOcupacionais ||
                "Não há riscos ocupacionais que necessitem de controle médico específico previsto no PCMSO."}
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b pb-1 mb-2">
              d) Exames ocupacionais clínicos e complementares realizados
            </h2>
            <p><strong>Indicação:</strong> {aso.examesRealizados}</p>
            <p><strong>Data de realização:</strong> {formatDate(aso.dataExame)}</p>
            <p className="text-xs text-slate-500 mt-1">Tipo de exame: {sol.tipoExame}</p>
          </section>

          <section>
            <h2 className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b pb-1 mb-2">
              e) Conclusão — aptidão para a função
            </h2>
            <p className="text-lg font-bold tracking-wide">
              {aso.conclusao === "APTO" ? "APTO para a função" : "INAPTO para a função"}
            </p>
            {aso.restricoes && (
              <p className="mt-1">
                <strong>Aptidões específicas / restrições (NR-10, NR-33, NR-35 etc.):</strong>{" "}
                {aso.restricoes}
              </p>
            )}
          </section>

          <section>
            <h2 className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b pb-1 mb-2">
              f) Médico responsável pelo PCMSO
            </h2>
            <p>
              {aso.medicoCoordNome
                ? `${aso.medicoCoordNome}${aso.medicoCoordCrm ? ` — CRM ${aso.medicoCoordCrm}` : ""}`
                : "Não informado"}
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b pb-1 mb-2">
              g) Médico que realizou o exame clínico
            </h2>
            <div className="flex justify-between items-end mt-4">
              <div>
                <p><strong>Nome:</strong> {aso.medicoNome || "—"}</p>
                <p><strong>CRM:</strong> {aso.medicoCrm ? `${aso.medicoCrm}/${aso.medicoCrmUf || ""}` : "—"}</p>
                <p><strong>Data:</strong> {formatDate(aso.dataEmissao)}</p>
              </div>
              <div className="text-center">
                <div className="border-t border-slate-800 w-48 pt-1 text-xs text-slate-500">
                  Assinatura e carimbo do médico
                </div>
              </div>
            </div>
          </section>

          {aso.observacoes && (
            <section>
              <h2 className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b pb-1 mb-2">
                Observações
              </h2>
              <p>{aso.observacoes}</p>
            </section>
          )}
        </div>

        <div className="border-t border-slate-300 px-6 py-3 text-xs text-slate-500 text-center">
          Documento gerado pelo SGS — Sistema de Gestão em Segurança do Trabalho · Conforme NR-7/MTE
          <br />
          Este ASO deve ser disponibilizado ao empregado (NR-7, item 7.5.19).
        </div>
      </div>
    </div>
  );
}
