import Link from "next/link";
import { notFound } from "next/navigation";
import { getPT } from "@/app/actions/operacional";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrintButton } from "@/components/print-button";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PtDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pt = await getPT(id);
  if (!pt) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <p className="text-sm text-sgs-800 font-medium">PT · {pt.tipo}</p>
          <h1 className="text-2xl font-bold text-slate-900">{pt.atividade}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {pt.empresa.nomeFantasia || pt.empresa.razaoSocial}
            {pt.numero ? ` · Nº ${pt.numero}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <PrintButton label="Imprimir / PDF" />
          <Link href="/pt">
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b bg-sgs-50/80">
          <CardTitle className="text-base">Permissão de Trabalho</CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Empresa</p>
            <p className="font-medium">{pt.empresa.razaoSocial}</p>
          </div>
          <div>
            <p className="text-slate-500">Status</p>
            <p className="font-medium">{pt.status}</p>
          </div>
          <div>
            <p className="text-slate-500">Local</p>
            <p className="font-medium">{pt.local}</p>
          </div>
          <div>
            <p className="text-slate-500">Período</p>
            <p className="font-medium">
              {formatDate(pt.dataInicio)}
              {pt.dataFim ? ` → ${formatDate(pt.dataFim)}` : ""}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-slate-500">Atividade</p>
            <p className="font-medium whitespace-pre-wrap">{pt.atividade}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-slate-500">Riscos</p>
            <p className="font-medium whitespace-pre-wrap">{pt.riscos || "—"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-slate-500">EPI</p>
            <p className="font-medium">{pt.epiNecessario || "—"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-slate-500">Medidas de controle</p>
            <p className="font-medium whitespace-pre-wrap">{pt.medidasControle || "—"}</p>
          </div>
          <div>
            <p className="text-slate-500">Autorizado por</p>
            <p className="font-medium">{pt.autorizadoPor || "—"}</p>
          </div>
          <div>
            <p className="text-slate-500">Executante</p>
            <p className="font-medium">
              {pt.executanteNome || pt.colaborador?.nome || "—"}
            </p>
          </div>
          {pt.observacoes && (
            <div className="sm:col-span-2">
              <p className="text-slate-500">Observações</p>
              <p className="font-medium">{pt.observacoes}</p>
            </div>
          )}

          <div className="sm:col-span-2 grid sm:grid-cols-2 gap-8 pt-8 text-center text-sm">
            <div>
              <div className="border-b border-slate-400 mb-1 h-10" />
              <p className="text-xs text-slate-500">Assinatura do autorizador</p>
            </div>
            <div>
              <div className="border-b border-slate-400 mb-1 h-10" />
              <p className="text-xs text-slate-500">Assinatura do executante</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
