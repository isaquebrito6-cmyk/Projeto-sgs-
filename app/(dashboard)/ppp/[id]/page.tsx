import Link from "next/link";
import { notFound } from "next/navigation";
import { getPPP } from "@/app/actions/operacional";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrintButton } from "@/components/print-button";
import { PppPeriodoForm } from "@/components/forms/ppp-periodo-form";
import { formatCPF, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PppDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ppp = await getPPP(id);
  if (!ppp) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <p className="text-sm text-sgs-800 font-medium">PPP · {ppp.status}</p>
          <h1 className="text-2xl font-bold">{ppp.colaborador.nome}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {ppp.empresa.nomeFantasia || ppp.empresa.razaoSocial}
          </p>
        </div>
        <div className="flex gap-2">
          <PrintButton label="Imprimir / PDF" />
          <Link href="/ppp">
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Dados do trabalhador e da empresa</CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Trabalhador</p>
            <p className="font-medium">{ppp.colaborador.nome}</p>
            <p className="text-xs text-slate-500">CPF {formatCPF(ppp.colaborador.cpf)}</p>
          </div>
          <div>
            <p className="text-slate-500">Função / setor atuais</p>
            <p className="font-medium">
              {ppp.colaborador.funcao?.nome || "—"}
              {ppp.colaborador.setor ? ` · ${ppp.colaborador.setor.nome}` : ""}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Empresa</p>
            <p className="font-medium">{ppp.empresa.razaoSocial}</p>
            <p className="text-xs text-slate-500">CNPJ {ppp.empresa.cnpj}</p>
          </div>
          <div>
            <p className="text-slate-500">NIT / CTPS</p>
            <p className="font-medium">
              {ppp.nit || "—"}
              {ppp.ctpsNumero ? ` · CTPS ${ppp.ctpsNumero}/${ppp.ctpsSerie || "—"}` : ""}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Admissão / demissão</p>
            <p className="font-medium">
              {ppp.dataAdmissao ? formatDate(ppp.dataAdmissao) : "—"}
              {ppp.dataDemissao ? ` → ${formatDate(ppp.dataDemissao)}` : ""}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Lotação</p>
            <p className="font-medium">{ppp.lotacao || "—"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-slate-500">Atividades</p>
            <p className="font-medium whitespace-pre-wrap">{ppp.descricaoAtividades || "—"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-slate-500">Fatores de risco (resumo)</p>
            <p className="font-medium whitespace-pre-wrap">{ppp.fatoresRisco || "—"}</p>
          </div>
          <div>
            <p className="text-slate-500">Profissional responsável</p>
            <p className="font-medium">{ppp.profissionalResponsavel || "—"}</p>
          </div>
          <div>
            <p className="text-slate-500">Registro</p>
            <p className="font-medium">{ppp.registroProfissional || "—"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Períodos laborais / exposição</CardTitle>
          <PppPeriodoForm pppId={ppp.id} />
        </CardHeader>
        <CardContent className="p-0">
          {ppp.periodos.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">Nenhum período cadastrado.</p>
          ) : (
            <div className="divide-y">
              {ppp.periodos.map((per) => (
                <div key={per.id} className="p-4 text-sm space-y-1">
                  <p className="font-semibold">
                    {formatDate(per.dataInicio)}
                    {per.dataFim ? ` → ${formatDate(per.dataFim)}` : " → atual"}
                  </p>
                  <p className="text-slate-600">
                    {[per.cargoFuncao, per.setor].filter(Boolean).join(" · ") || "—"}
                  </p>
                  {per.fatoresRisco && (
                    <p className="text-slate-700 whitespace-pre-wrap">{per.fatoresRisco}</p>
                  )}
                  <p className="text-xs text-slate-400">
                    Intensidade: {per.intensidade || "—"} · Técnica: {per.tecnicaUtilizada || "—"}
                    {" · "}
                    EPC {per.epcEficaz == null ? "—" : per.epcEficaz ? "eficaz" : "não"}
                    {" · "}
                    EPI {per.epiEficaz == null ? "—" : per.epiEficaz ? "eficaz" : "não"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-slate-400 print:hidden">
        Documento de apoio interno. A transmissão oficial do PPP observa as regras da Previdência /
        eSocial vigentes.
      </p>
    </div>
  );
}
