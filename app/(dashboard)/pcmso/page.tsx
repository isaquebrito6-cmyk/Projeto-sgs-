import Link from "next/link";
import { Plus, Stethoscope } from "lucide-react";
import { listPCMSOs } from "@/app/actions/pcmso";
import { listEmpresas } from "@/app/actions/empresas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { STATUS_DOCUMENTO_LABELS } from "@/types";

const statusColor: Record<string, string> = {
  RASCUNHO: "bg-slate-100 text-slate-700",
  EM_REVISAO: "bg-amber-100 text-amber-700",
  APROVADO: "bg-emerald-100 text-emerald-700",
  VENCIDO: "bg-red-100 text-red-700",
};

export default async function PCMSOPage({
  searchParams,
}: {
  searchParams: Promise<{ empresaId?: string }>;
}) {
  const params = await searchParams;
  const [pcmsos, empresas] = await Promise.all([
    listPCMSOs(params.empresaId),
    listEmpresas(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">PCMSO</h1>
          <p className="text-slate-500 mt-1">
            Programa de Controle Médico de Saúde Ocupacional (NR-7)
          </p>
        </div>
        <Link href="/pcmso/novo">
          <Button className="bg-sgs-700 hover:bg-sgs-800">
            <Plus className="w-4 h-4" />
            Novo PCMSO
          </Button>
        </Link>
      </div>

      {empresas.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link href="/pcmso" className={`rounded-full px-3 py-1 text-sm font-medium transition ${!params.empresaId ? "bg-sgs-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            Todas
          </Link>
          {empresas.map((emp) => (
            <Link key={emp.id} href={`/pcmso?empresaId=${emp.id}`} className={`rounded-full px-3 py-1 text-sm font-medium transition ${params.empresaId === emp.id ? "bg-sgs-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {emp.nomeFantasia || emp.razaoSocial}
            </Link>
          ))}
        </div>
      )}

      {pcmsos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-sgs-100 flex items-center justify-center mb-4">
              <Stethoscope className="w-7 h-7 text-sgs-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Nenhum PCMSO cadastrado</h3>
            <p className="text-slate-500 mt-1 max-w-sm">
              Crie o PCMSO vinculado a um PGR para definir os exames ocupacionais.
            </p>
            <Link href="/pcmso/novo" className="mt-6">
              <Button className="bg-sgs-700 hover:bg-sgs-800">
                <Plus className="w-4 h-4" /> Criar PCMSO
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {pcmsos.map((p) => (
            <Link key={p.id} href={`/pcmso/${p.id}`}>
              <Card className="hover:shadow-md transition cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                        <Stethoscope className="w-5 h-5 text-teal-700" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{p.titulo}</h3>
                        <p className="text-sm text-slate-500">
                          {p.empresa.nomeFantasia || p.empresa.razaoSocial} · v{p.versao}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {p._count.exames} exame(s)
                          {p.pgr && ` · Vinculado: ${p.pgr.titulo}`}
                          {p.medicoCoordenador && ` · Dr(a). ${p.medicoCoordenador.nome}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[p.status]}`}>
                        {STATUS_DOCUMENTO_LABELS[p.status]}
                      </span>
                      <span className="text-xs text-slate-400">{formatDate(p.dataElaboracao)}</span>
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
