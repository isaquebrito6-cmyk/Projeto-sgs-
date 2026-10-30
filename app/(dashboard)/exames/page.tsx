import Link from "next/link";
import { Plus, ClipboardList } from "lucide-react";
import { listSolicitacoes } from "@/app/actions/exames";
import { listEmpresas } from "@/app/actions/empresas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCPF, formatDate } from "@/lib/utils";
import { STATUS_SOLICITACAO_LABELS } from "@/types";

const statusColor: Record<string, string> = {
  PENDENTE: "bg-slate-100 text-slate-700",
  ENVIADA_CLINICA: "bg-blue-100 text-blue-700",
  EM_ATENDIMENTO: "bg-amber-100 text-amber-700",
  ASO_EMITIDO: "bg-emerald-100 text-emerald-700",
  CANCELADA: "bg-red-100 text-red-700",
};

export default async function ExamesPage({
  searchParams,
}: {
  searchParams: Promise<{ empresaId?: string; status?: string }>;
}) {
  const params = await searchParams;
  const [solicitacoes, empresas] = await Promise.all([
    listSolicitacoes({ empresaId: params.empresaId, status: params.status }),
    listEmpresas(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Exames / ASO</h1>
          <p className="text-slate-500 mt-1">
            Solicitações de exames ocupacionais e Atestados de Saúde Ocupacional (NR-7)
          </p>
        </div>
        <Link href="/exames/nova">
          <Button className="bg-sgs-700 hover:bg-sgs-800">
            <Plus className="w-4 h-4" />
            Solicitar exame
          </Button>
        </Link>
      </div>

      {empresas.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link href="/exames" className={`rounded-full px-3 py-1 text-sm font-medium transition ${!params.empresaId ? "bg-sgs-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            Todas
          </Link>
          {empresas.map((emp) => (
            <Link key={emp.id} href={`/exames?empresaId=${emp.id}`} className={`rounded-full px-3 py-1 text-sm font-medium transition ${params.empresaId === emp.id ? "bg-sgs-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {emp.nomeFantasia || emp.razaoSocial}
            </Link>
          ))}
        </div>
      )}

      {solicitacoes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-sgs-100 flex items-center justify-center mb-4">
              <ClipboardList className="w-7 h-7 text-sgs-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Nenhuma solicitação</h3>
            <p className="text-slate-500 mt-1 max-w-sm">
              Solicite exames ocupacionais (admissional, periódico, demissional etc.) conforme o PCMSO.
            </p>
            <Link href="/exames/nova" className="mt-6">
              <Button className="bg-sgs-700 hover:bg-sgs-800">
                <Plus className="w-4 h-4" /> Solicitar exame
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {solicitacoes.map((sol) => (
            <Link key={sol.id} href={`/exames/${sol.id}`}>
              <Card className="hover:shadow-md transition cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{sol.colaborador.nome}</h3>
                      <p className="text-sm text-slate-500">
                        {sol.tipoExame} · CPF {formatCPF(sol.colaborador.cpf)}
                        {sol.colaborador.funcao && ` · ${sol.colaborador.funcao.nome}`}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {sol.empresa.nomeFantasia || sol.empresa.razaoSocial}
                        {sol.clinica && ` → ${sol.clinica.nomeFantasia || sol.clinica.razaoSocial}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[sol.status]}`}>
                        {STATUS_SOLICITACAO_LABELS[sol.status]}
                      </span>
                      {sol.aso && (
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          sol.aso.conclusao === "APTO" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        }`}>
                          {sol.aso.conclusao}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{formatDate(sol.dataSolicitacao)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
