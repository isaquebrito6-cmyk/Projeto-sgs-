import Link from "next/link";
import { Plus, AlertTriangle } from "lucide-react";
import { listCATs } from "@/app/actions/operacional";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CatListPage() {
  const itens = await listCATs();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">CAT</h1>
          <p className="text-slate-500 mt-1">
            Comunicação de Acidente de Trabalho — registro interno e impressão
          </p>
        </div>
        <Link href="/cat/nova">
          <Button className="bg-sgs-700 hover:bg-sgs-800">
            <Plus className="w-4 h-4" />
            Nova CAT
          </Button>
        </Link>
      </div>

      {itens.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7 text-amber-700" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Nenhuma CAT registrada</h3>
            <p className="text-slate-500 mt-1 max-w-sm">
              Registre acidentes do trabalho para controle interno e apoio à emissão oficial (eSocial
              / INSS).
            </p>
            <Link href="/cat/nova" className="mt-6">
              <Button className="bg-sgs-700 hover:bg-sgs-800">
                <Plus className="w-4 h-4" />
                Registrar CAT
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {itens.map((c) => (
            <Link key={c.id} href={`/cat/${c.id}`}>
              <Card className="hover:shadow-md transition cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900">{c.colaborador.nome}</h3>
                        <span className="rounded-full bg-amber-100 text-amber-900 text-xs px-2 py-0.5">
                          {c.tipo}
                        </span>
                        <span className="rounded-full bg-slate-100 text-slate-700 text-xs px-2 py-0.5">
                          {c.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{c.descricao}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {c.empresa.nomeFantasia || c.empresa.razaoSocial} ·{" "}
                        {formatDate(c.dataAcidente)}
                        {c.horaAcidente ? ` · ${c.horaAcidente}` : ""}
                      </p>
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
