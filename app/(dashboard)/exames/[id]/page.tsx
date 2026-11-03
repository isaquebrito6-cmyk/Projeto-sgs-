import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Printer, FileCheck, Send } from "lucide-react";
import { getSolicitacao } from "@/app/actions/exames";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ASOEmitirForm } from "@/components/forms/aso-emitir-form";
import { formatCPF, formatCNPJ, formatDate } from "@/lib/utils";
import { STATUS_SOLICITACAO_LABELS } from "@/types";

export default async function SolicitacaoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sol = await getSolicitacao(id);
  if (!sol) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/exames">
            <Button variant="ghost" size="icon" className="mt-0.5">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{sol.colaborador.nome}</h1>
            <p className="text-slate-500 mt-1">
              {sol.tipoExame} · {STATUS_SOLICITACAO_LABELS[sol.status]}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/exames/${id}/kit-clinica`} target="_blank">
            <Button className="bg-sgs-700 hover:bg-sgs-800">
              <Send className="w-4 h-4" />
              Kit para clínica
            </Button>
          </Link>
          {sol.aso && (
            <Link href={`/exames/${id}/aso`} target="_blank">
              <Button variant="outline">
                <Printer className="w-4 h-4" /> Imprimir ASO
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Card className="border-sgs-200 bg-sgs-50/40">
        <CardContent className="p-4 text-sm text-slate-700">
          <strong>Fluxo:</strong> 1) Gere o <em>Kit para clínica</em> (solicitação + anamnese +
          psicossocial) e envie/imprima · 2) Após o atendimento, a clínica preenche os checklists e{" "}
          <em>emite o ASO</em> nesta tela · 3) Imprima o ASO para o trabalhador e o arquivo da empresa.
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados da solicitação</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Colaborador</dt>
                <dd className="font-medium">
                  {sol.colaborador.nome} — CPF {formatCPF(sol.colaborador.cpf)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Função / Setor</dt>
                <dd className="font-medium">
                  {sol.colaborador.funcao?.nome || "—"}
                  {sol.colaborador.setor && ` · ${sol.colaborador.setor.nome}`}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Empresa</dt>
                <dd className="font-medium">
                  {sol.empresa.razaoSocial} — CNPJ {formatCNPJ(sol.empresa.cnpj)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Clínica</dt>
                <dd className="font-medium">
                  {sol.clinica
                    ? sol.clinica.nomeFantasia || sol.clinica.razaoSocial
                    : "Não definida"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Tipo de exame (NR-7)</dt>
                <dd className="font-medium">{sol.tipoExame}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Data da solicitação</dt>
                <dd className="font-medium">{formatDate(sol.dataSolicitacao)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Riscos ocupacionais (PGR/PCMSO)</dt>
                <dd className="font-medium mt-0.5">
                  {sol.riscosInformados ||
                    "Não informados — preencher conforme inventário do PGR"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Exames solicitados</dt>
                <dd className="font-medium">{sol.examesSolicitados || "—"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {sol.aso ? (
          <Card className="border-emerald-200 bg-emerald-50/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-emerald-800">
                <FileCheck className="w-5 h-5" /> ASO Emitido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">Conclusão</dt>
                  <dd
                    className={`font-bold text-lg ${
                      sol.aso.conclusao === "APTO" ? "text-emerald-700" : "text-red-700"
                    }`}
                  >
                    {sol.aso.conclusao}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Data do exame</dt>
                  <dd className="font-medium">{formatDate(sol.aso.dataExame)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Médico examinador</dt>
                  <dd className="font-medium">
                    {sol.aso.medicoNome || "—"}
                    {sol.aso.medicoCrm &&
                      ` — CRM ${sol.aso.medicoCrm}/${sol.aso.medicoCrmUf || ""}`}
                  </dd>
                </div>
                {sol.aso.restricoes && (
                  <div>
                    <dt className="text-slate-500">Restrições</dt>
                    <dd className="font-medium">{sol.aso.restricoes}</dd>
                  </div>
                )}
                <div className="pt-2 flex flex-wrap gap-2">
                  <Link href={`/exames/${id}/aso`} target="_blank">
                    <Button className="bg-sgs-700 hover:bg-sgs-800">
                      <Printer className="w-4 h-4" /> Abrir ASO
                    </Button>
                  </Link>
                  <Link href={`/exames/${id}/kit-clinica`} target="_blank">
                    <Button variant="outline">Kit clínica</Button>
                  </Link>
                </div>
              </dl>
            </CardContent>
          </Card>
        ) : (
          <ASOEmitirForm
            solicitacaoId={sol.id}
            riscosDefault={sol.riscosInformados || ""}
            examesDefault={sol.examesSolicitados || "Exame clínico ocupacional"}
            medicos={sol.clinica?.medicos || []}
          />
        )}
      </div>
    </div>
  );
}
