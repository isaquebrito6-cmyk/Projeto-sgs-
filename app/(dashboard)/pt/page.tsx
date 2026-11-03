import Link from "next/link";
import { Plus, ClipboardCheck } from "lucide-react";
import { listPTs } from "@/app/actions/operacional";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TIPO_LABEL: Record<string, string> = {
  PT_GERAL: "Geral",
  PT_ALTURA: "Altura",
  PT_QUENTE: "A quente",
  PT_ELETRICA: "Elétrica",
  PT_OUTRA: "Outra",
};

export default async function PtListPage() {
  const itens = await listPTs();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Permissão de Trabalho (PT)</h1>
          <p className="text-slate-500 mt-1">Controle de atividades com riscos específicos</p>
        </div>
        <Link href="/pt/nova">
          <Button className="bg-sgs-700 hover:bg-sgs-800">
            <Plus className="w-4 h-4" />
            Nova PT
          </Button>
        </Link>
      </div>

      {itens.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-sgs-100 flex items-center justify-center mb-4">
              <ClipboardCheck className="w-7 h-7 text-sgs-700" />
            </div>
            <h3 className="text-lg font-semibold">Nenhuma PT emitida</h3>
            <p className="text-slate-500 mt-1 max-w-sm">
              Emita permissões de trabalho para altura, eletricidade, trabalho a quente e demais atividades.
            </p>
            <Link href="/pt/nova" className="mt-6">
              <Button className="bg-sgs-700 hover:bg-sgs-800">
                <Plus className="w-4 h-4" />
                Emitir PT
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {itens.map((p) => (
            <Link key={p.id} href={`/pt/${p.id}`}>
              <Card className="hover:shadow-md transition cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{p.atividade}</h3>
                    <span className="rounded-full bg-sgs-100 text-sgs-800 text-xs px-2 py-0.5">
                      {TIPO_LABEL[p.tipo] || p.tipo}
                    </span>
                    <span className="rounded-full bg-slate-100 text-slate-600 text-xs px-2 py-0.5">
                      {p.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{p.local}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {p.empresa.nomeFantasia || p.empresa.razaoSocial} · {formatDate(p.dataInicio)}
                    {p.numero ? ` · Nº ${p.numero}` : ""}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
