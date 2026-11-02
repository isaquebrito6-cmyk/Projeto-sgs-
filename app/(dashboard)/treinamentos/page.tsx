import Link from "next/link";
import { Plus, GraduationCap, FolderOpen, List } from "lucide-react";
import { listTreinamentos } from "@/app/actions/treinamentos";
import { CATALOGO_TREINAMENTOS } from "@/lib/nr-treinamentos";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TreinamentosPage() {
  const itens = await listTreinamentos();
  const totalCatalogo = CATALOGO_TREINAMENTOS.length;

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
          <Link href="/treinamentos/catalogo">
            <Button variant="outline">
              <List className="w-4 h-4" />
              Catálogo NR ({totalCatalogo})
            </Button>
          </Link>
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

      {/* Atalho da lista por NR */}
      <Card className="border-sgs-200">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-medium text-slate-900">Lista de treinamentos por norma</p>
            <p className="text-sm text-slate-500">
              NR-01, NR-05, NR-06, NR-10, NR-11, NR-12, NR-18, NR-20, NR-33, NR-35, DDS e Brigada
            </p>
          </div>
          <Link href="/treinamentos/catalogo">
            <Button variant="outline" size="sm">
              <List className="w-4 h-4" />
              Ver catálogo completo
            </Button>
          </Link>
        </CardContent>
      </Card>

      {itens.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-sgs-100 flex items-center justify-center mb-4">
              <GraduationCap className="w-7 h-7 text-sgs-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Nenhum treinamento registrado</h3>
            <p className="text-slate-500 mt-1 max-w-sm">
              Escolha um item no catálogo de NRs ou registre um treinamento avulso.
            </p>
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              <Link href="/treinamentos/catalogo">
                <Button variant="outline">
                  <List className="w-4 h-4" />
                  Abrir catálogo
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
