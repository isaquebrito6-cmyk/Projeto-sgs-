import Link from "next/link";
import { Plus, IdCard } from "lucide-react";
import { listPPPs } from "@/app/actions/operacional";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCPF } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PppListPage() {
  const itens = await listPPPs();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">PPP</h1>
          <p className="text-slate-500 mt-1">Perfil Profissiográfico Previdenciário</p>
        </div>
        <Link href="/ppp/novo">
          <Button className="bg-sgs-700 hover:bg-sgs-800">
            <Plus className="w-4 h-4" />
            Novo PPP
          </Button>
        </Link>
      </div>

      {itens.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-sgs-100 flex items-center justify-center mb-4">
              <IdCard className="w-7 h-7 text-sgs-700" />
            </div>
            <h3 className="text-lg font-semibold">Nenhum PPP cadastrado</h3>
            <p className="text-slate-500 mt-1 max-w-sm">
              Monte o perfil do trabalhador com períodos e fatores de risco para arquivo e impressão.
            </p>
            <Link href="/ppp/novo" className="mt-6">
              <Button className="bg-sgs-700 hover:bg-sgs-800">
                <Plus className="w-4 h-4" />
                Cadastrar PPP
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {itens.map((p) => (
            <Link key={p.id} href={`/ppp/${p.id}`}>
              <Card className="hover:shadow-md transition cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{p.colaborador.nome}</h3>
                    <span className="rounded-full bg-slate-100 text-xs px-2 py-0.5">{p.status}</span>
                    <span className="text-xs text-slate-400">{p._count.periodos} período(s)</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    CPF {formatCPF(p.colaborador.cpf)} ·{" "}
                    {p.empresa.nomeFantasia || p.empresa.razaoSocial}
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
