import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Stethoscope, RefreshCw } from "lucide-react";
import { getPGR, sincronizarCaracterizacaoPGR } from "@/app/actions/pgr";
import { labelGrauRisco } from "@/lib/pgr-nr1";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PGRInventario } from "@/components/pgr-inventario";
import { PGRPlanoAcao } from "@/components/pgr-plano-acao";
import { SyncPGRButton } from "@/components/sync-pgr-button";
import { formatDate, formatCNPJ } from "@/lib/utils";
import { STATUS_DOCUMENTO_LABELS } from "@/types";

const statusColor: Record<string, string> = {
  RASCUNHO: "bg-slate-100 text-slate-700",
  EM_REVISAO: "bg-amber-100 text-amber-700",
  APROVADO: "bg-emerald-100 text-emerald-700",
  VENCIDO: "bg-red-100 text-red-700",
};

export const dynamic = "force-dynamic";

export default async function PGRDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pgr = await getPGR(id);
  if (!pgr) notFound();

  const setores = pgr.empresa.setores || [];
  const emp = pgr.empresa;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/pgr">
            <Button variant="ghost" size="icon" className="mt-0.5">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{pgr.titulo}</h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  statusColor[pgr.status]
                }`}
              >
                {STATUS_DOCUMENTO_LABELS[pgr.status]}
              </span>
            </div>
            <p className="text-slate-500 mt-1">
              {emp.nomeFantasia || emp.razaoSocial} · v{pgr.versao} · {formatDate(pgr.dataElaboracao)}
              {emp.grauRisco != null && <> · GR {emp.grauRisco}</>}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <SyncPGRButton pgrId={id} />
          {!pgr.pcmso && (
            <Link href={`/pcmso/novo?pgrId=${pgr.id}&empresaId=${pgr.empresaId}`}>
              <Button variant="outline" disabled={pgr.inventarioItens.length === 0}>
                <Stethoscope className="w-4 h-4" />
                Gerar PCMSO
              </Button>
            </Link>
          )}
          {pgr.pcmso && (
            <Link href={`/pcmso/${pgr.pcmso.id}`}>
              <Button variant="outline">
                <Stethoscope className="w-4 h-4" />
                Ver PCMSO
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Empresa / NR-4 / estrutura */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Empresa, grau de risco e estrutura (NR-1 / NR-4)</CardTitle>
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
            <span className="text-slate-500">Grau de risco (NR-4):</span>{" "}
            {labelGrauRisco(emp.grauRisco)}
          </p>
          <p className="sm:col-span-2">
            <span className="text-slate-500">Setores / funções / GHE:</span>{" "}
            {setores.length === 0
              ? "nenhum setor — cadastre na empresa"
              : setores
                  .map(
                    (s) =>
                      `${s.nome} (${s._count.colaboradores} colab.; ${s.funcoes.length} funç.; ${s.ghes.length} GHE)`
                  )
                  .join(" · ")}
          </p>
        </CardContent>
      </Card>

      {pgr.inventarioItens.length === 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Preencha o <strong>inventário de riscos</strong> (obrigatório na NR-1). Use setor, função e
          GHE já cadastrados. Depois monte o <strong>plano de ação</strong> e gere o{" "}
          <strong>PCMSO</strong>.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-4 h-4" /> Dados do programa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-slate-500">Elaborador</dt>
              <dd className="font-medium">{pgr.elaboradorNome || "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Registro profissional</dt>
              <dd className="font-medium">{pgr.elaboradorRegistro || "—"}</dd>
            </div>
            {pgr.caracterizacaoProcessos && (
              <div className="sm:col-span-2">
                <dt className="text-slate-500">Caracterização (empresa + setores + GHE)</dt>
                <dd className="font-medium mt-0.5 whitespace-pre-wrap text-xs sm:text-sm">
                  {pgr.caracterizacaoProcessos}
                </dd>
              </div>
            )}
            {pgr.metodologiaAvaliacao && (
              <div className="sm:col-span-2">
                <dt className="text-slate-500">Metodologia de avaliação (NR-1)</dt>
                <dd className="font-medium mt-0.5 whitespace-pre-wrap text-xs sm:text-sm">
                  {pgr.metodologiaAvaliacao}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <PGRInventario pgrId={id} itens={pgr.inventarioItens} setores={setores} />

      <PGRPlanoAcao pgrId={id} itens={pgr.planoAcaoItens} />
    </div>
  );
}
