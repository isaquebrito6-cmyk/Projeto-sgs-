import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Stethoscope, FileText, Printer } from "lucide-react";
import { getPCMSO } from "@/app/actions/pcmso";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PCMSOExames } from "@/components/pcmso-exames";
import { formatDate, formatCNPJ } from "@/lib/utils";
import { STATUS_DOCUMENTO_LABELS, TIPO_RISCO_LABELS } from "@/types";
import { labelGrauRisco } from "@/lib/pgr-nr1";

export default async function PCMSODetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pcmso = await getPCMSO(id);
  if (!pcmso) notFound();

  const emp = pcmso.empresa;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/pcmso">
            <Button variant="ghost" size="icon" className="mt-0.5">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{pcmso.titulo}</h1>
            <p className="text-slate-500 mt-1">
              {emp.nomeFantasia || emp.razaoSocial} · v{pcmso.versao} ·{" "}
              {formatDate(pcmso.dataElaboracao)}
            </p>
            <span className="inline-block mt-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium">
              {STATUS_DOCUMENTO_LABELS[pcmso.status]}
            </span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href={`/pcmso/${id}/documento`} target="_blank">
            <Button className="bg-sgs-700 hover:bg-sgs-800">
              <Printer className="w-4 h-4" />
              Documento / Imprimir
            </Button>
          </Link>
          {pcmso.pgr && (
            <Link href={`/pgr/${pcmso.pgr.id}`}>
              <Button variant="outline">
                <FileText className="w-4 h-4" /> Ver PGR vinculado
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Empresa (dados incorporados automaticamente)</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-3 text-sm">
          <p>
            <span className="text-slate-500">Razão social:</span> {emp.razaoSocial}
          </p>
          <p>
            <span className="text-slate-500">CNPJ:</span> {formatCNPJ(emp.cnpj)}
          </p>
          <p>
            <span className="text-slate-500">CNAE:</span> {emp.cnae || "—"}
          </p>
          <p>
            <span className="text-slate-500">Grau de risco:</span> {labelGrauRisco(emp.grauRisco)}
          </p>
          <p className="sm:col-span-2">
            <span className="text-slate-500">Endereço:</span>{" "}
            {[emp.endereco, emp.cidade, emp.uf].filter(Boolean).join(", ") || "—"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Stethoscope className="w-4 h-4" /> Dados do programa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-slate-500">Médico responsável</dt>
              <dd className="font-medium">
                {pcmso.responsavelNome || pcmso.medicoCoordenador?.nome || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">CRM</dt>
              <dd className="font-medium">
                {pcmso.responsavelCrm ||
                  (pcmso.medicoCoordenador
                    ? `${pcmso.medicoCoordenador.crm}/${pcmso.medicoCoordenador.crmUf}`
                    : "—")}
              </dd>
            </div>
            {pcmso.pgr && (
              <div className="sm:col-span-2">
                <dt className="text-slate-500">Riscos do PGR vinculado</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {pcmso.pgr.inventarioItens.map((item) => (
                    <span key={item.id} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs">
                      {item.risco.nome} ({TIPO_RISCO_LABELS[item.risco.tipo]})
                    </span>
                  ))}
                  {pcmso.pgr.inventarioItens.length === 0 && (
                    <span className="text-slate-400">Nenhum risco no inventário</span>
                  )}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <PCMSOExames pcmsoId={id} exames={pcmso.exames} />
    </div>
  );
}
