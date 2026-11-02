import Link from "next/link";
import { Plus, GraduationCap, FolderOpen } from "lucide-react";
import { listTreinamentos } from "@/app/actions/treinamentos";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TreinamentosPage() {
  const itens = await listTreinamentos();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Treinamentos / DDS</h1>
          <p className="text-slate-500 mt-1">
            Registre treinamentos de NRs, DDS e controle de participantes
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/treinamentos/materiais">
            <Button variant="outline">
              <FolderOpen className="w-4 h-4" />
              Materiais / pasta
            </Button>
          </Link>
          <Link href="/treinamentos/novo">
            <Button className="bg-sgs-700 hover:bg-sgs-800">
              <Plus className="w-4 h-4" />
              Novo treinamento
            </Button>
          </Link>
        </div>
      </div>

      {itens.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-sgs-100 flex items-center justify-center mb-4">
              <GraduationCap className="w-7 h-7 text-sgs-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Nenhum treinamento registrado</h3>
            <p className="text-slate-500 mt-1 max-w-sm">
              Cadastre DDS, NR-06, NR-10 e outros. Configure a pasta de materiais na nuvem para abrir
              o conteúdo na hora do treinamento.
            </p>
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              <Link href="/treinamentos/materiais">
                <Button variant="outline">
                  <FolderOpen className="w-4 h-4" />
                  Configurar pasta
                </Button>
              </Link>
              <Link href="/treinamentos/novo">
                <Button className="bg-sgs-700 hover:bg-sgs-800">
                  <Plus className="w-4 h-4" />
                  Registrar treinamento
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {itens.map((t) => (
            <Link key={t.id} href={`/treinamentos/${t.id}`}>
              <Card className="hover:shadow-md transition cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900">{t.titulo}</h3>
                        <span className="rounded-full bg-sgs-100 text-sgs-800 text-xs px-2 py-0.5">
                          {t.tipo}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {t.empresa.nomeFantasia || t.empresa.razaoSocial}
                        {t.dataRealizacao && <> · {formatDate(t.dataRealizacao)}</>}
                        {t.cargaHoraria != null && <> · {t.cargaHoraria}h</>}
                      </p>
                    </div>
                    <p className="text-sm text-slate-500">
                      {t._count.participantes} participante(s)
                    </p>
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
