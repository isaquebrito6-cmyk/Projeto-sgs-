import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, CalendarClock, Plus } from "lucide-react";
import {
  CATALOGO_TREINAMENTOS,
  formatValidadeLabel,
  type CatalogoTreinamento,
} from "@/lib/nr-treinamentos";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

function agruparPorNorma(itens: CatalogoTreinamento[]) {
  const map = new Map<string, CatalogoTreinamento[]>();
  for (const item of itens) {
    const key = item.norma;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return Array.from(map.entries());
}

const TIPO_LABEL: Record<string, string> = {
  INICIAL: "Inicial",
  PERIODICO: "Periódico",
  EVENTUAL: "Eventual",
  DDS: "DDS",
};

const MOD_LABEL: Record<string, string> = {
  PRESENCIAL: "Presencial",
  EAD_OU_SEMI: "EAD / semipresencial",
  CONFORME_NR: "Conforme a NR",
};

export default function CatalogoTreinamentosPage() {
  const grupos = agruparPorNorma(CATALOGO_TREINAMENTOS);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/treinamentos">
            <Button variant="ghost" size="icon" className="mt-0.5">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Catálogo de treinamentos
            </h1>
            <p className="text-slate-500 mt-1">
              Lista orientativa conforme NRs do MTE — escolha um item para registrar o treinamento
            </p>
          </div>
        </div>
        <Link href="/treinamentos/novo">
          <Button className="bg-sgs-700 hover:bg-sgs-800">
            <Plus className="w-4 h-4" />
            Novo treinamento
          </Button>
        </Link>
      </div>

      <Card className="border-sgs-200 bg-sgs-50/50">
        <CardContent className="p-4 text-sm text-slate-600">
          Valores de carga e validade são <strong>orientativos</strong>. Sempre confirme no texto
          vigente da norma e na realidade da empresa (grau de risco, função e processos).
        </CardContent>
      </Card>

      <div className="space-y-8">
        {grupos.map(([norma, itens]) => (
          <section key={norma} id={norma.replace(/\s+/g, "-").toLowerCase()} className="space-y-3">
            <div className="flex items-center gap-2 border-b border-sgs-200 pb-2">
              <BookOpen className="w-4 h-4 text-sgs-700" />
              <h2 className="text-lg font-bold text-sgs-900">{norma}</h2>
              <span className="text-xs text-slate-400">
                {itens.length} treinamento{itens.length > 1 ? "s" : ""}
              </span>
            </div>

            <ul className="space-y-2">
              {itens.map((item) => (
                <li key={item.id}>
                  <Card className="hover:shadow-sm transition">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-900">{item.titulo}</h3>
                            <span className="rounded-full bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5">
                              {TIPO_LABEL[item.tipoCapacitacao] || item.tipoCapacitacao}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.cargaHorariaMin != null
                                ? `${item.cargaHorariaMin}h (mín./sugestão)`
                                : "Carga conforme riscos / empregador"}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <CalendarClock className="w-3 h-3" />
                              {formatValidadeLabel(item.validadeMeses)}
                            </span>
                            <span>{MOD_LABEL[item.modalidade] || item.modalidade}</span>
                          </div>

                          <p className="text-sm text-slate-600 leading-relaxed">
                            {item.conteudoProgramatico}
                          </p>

                          {item.observacao && (
                            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded px-2 py-1">
                              {item.observacao}
                            </p>
                          )}
                        </div>

                        <Link
                          href={`/treinamentos/novo?catalogo=${encodeURIComponent(item.id)}`}
                          className="shrink-0"
                        >
                          <Button size="sm" variant="outline">
                            <Plus className="w-3.5 h-3.5" />
                            Usar
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
