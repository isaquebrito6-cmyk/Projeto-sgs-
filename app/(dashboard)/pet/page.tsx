import Link from "next/link";
import { Plus, DoorOpen } from "lucide-react";
import { listPETs } from "@/app/actions/operacional";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PetListPage() {
  const itens = await listPETs();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">PET — Espaço confinado</h1>
          <p className="text-slate-500 mt-1">Permissão de Entrada e Trabalho · NR-33</p>
        </div>
        <Link href="/pet/nova">
          <Button className="bg-sgs-700 hover:bg-sgs-800">
            <Plus className="w-4 h-4" />
            Nova PET
          </Button>
        </Link>
      </div>

      {itens.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-sgs-100 flex items-center justify-center mb-4">
              <DoorOpen className="w-7 h-7 text-sgs-700" />
            </div>
            <h3 className="text-lg font-semibold">Nenhuma PET emitida</h3>
            <p className="text-slate-500 mt-1 max-w-sm">
              Emita a permissão de entrada e trabalho antes de acessar espaços confinados (NR-33).
            </p>
            <Link href="/pet/nova" className="mt-6">
              <Button className="bg-sgs-700 hover:bg-sgs-800">
                <Plus className="w-4 h-4" />
                Emitir PET
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {itens.map((p) => (
            <Link key={p.id} href={`/pet/${p.id}`}>
              <Card className="hover:shadow-md transition cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{p.identificacaoEspaco}</h3>
                    <span className="rounded-full bg-slate-100 text-xs px-2 py-0.5">{p.status}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{p.atividade}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {p.empresa.nomeFantasia || p.empresa.razaoSocial} · {formatDate(p.dataEntrada)}
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
