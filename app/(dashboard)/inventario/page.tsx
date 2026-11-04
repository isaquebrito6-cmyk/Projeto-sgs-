import Link from "next/link";
import { AlertTriangle, Building2 } from "lucide-react";
import { listEmpresasParaInventario } from "@/app/actions/inventario";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function InventarioIndexPage() {
  const empresas = await listEmpresasParaInventario();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-7 h-7 text-amber-600" />
          Inventário de Riscos
        </h1>
        <p className="text-slate-500 mt-1">
          Formulário independente (NR-1). Ao preencher, alimenta o PGR da empresa, o PCMSO e as
          solicitações de exame.
        </p>
      </div>

      {empresas.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-slate-500">
            Nenhuma empresa cadastrada.{" "}
            <Link href="/empresas/nova" className="text-sgs-700 font-medium underline">
              Cadastre uma empresa
            </Link>{" "}
            primeiro.
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {empresas.map((e) => (
            <Link key={e.id} href={`/inventario/${e.id}`}>
              <Card className="h-full hover:shadow-md transition cursor-pointer border-slate-200 hover:border-sgs-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-start gap-2">
                    <Building2 className="w-4 h-4 mt-0.5 text-sgs-700 shrink-0" />
                    <span className="leading-snug">{e.nomeFantasia || e.razaoSocial}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-500 space-y-1">
                  <p>{e.razaoSocial}</p>
                  <p>
                    {e._count.setores} setor(es) · {e._count.colaboradores} colaborador(es) ·{" "}
                    {e._count.pgrs} PGR(s)
                  </p>
                  {e.grauRisco != null && <p>Grau de risco NR-4: {e.grauRisco}</p>}
                  <Button size="sm" className="mt-3 w-full bg-sgs-700 hover:bg-sgs-800" asChild>
                    <span>Abrir inventário</span>
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
