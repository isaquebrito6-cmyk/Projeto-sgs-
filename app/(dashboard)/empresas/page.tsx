import Link from "next/link";
import { Plus, Building2, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCNPJ } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EmpresasPage() {
  const empresas = await prisma.empresa.findMany({
    orderBy: { razaoSocial: "asc" },
    include: {
      _count: {
        select: { colaboradores: true, pgrs: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Empresas</h1>
          <p className="text-slate-500 mt-1">Cadastro e gestão das empresas clientes</p>
        </div>
        <Link href="/empresas/nova">
          <Button className="bg-sgs-700 hover:bg-sgs-800">
            <Plus className="w-4 h-4" />
            Nova empresa
          </Button>
        </Link>
      </div>

      {empresas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Building2 className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="font-semibold text-lg text-slate-900">Nenhuma empresa cadastrada</h3>
            <p className="text-slate-500 mt-1 max-w-sm">
              Comece cadastrando a primeira empresa para elaborar PGR, PCMSO e gerenciar exames.
            </p>
            <Link href="/empresas/nova" className="mt-6">
              <Button className="bg-sgs-700 hover:bg-sgs-800">
                <Plus className="w-4 h-4" />
                Cadastrar empresa
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {empresas.map((empresa) => (
            <Link key={empresa.id} href={`/empresas/${empresa.id}`}>
              <Card className="hover:shadow-md transition cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-lg bg-sgs-100 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-sgs-700" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {empresa.nomeFantasia || empresa.razaoSocial}
                        </h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {empresa.razaoSocial}
                          {empresa.nomeFantasia && empresa.nomeFantasia !== empresa.razaoSocial
                            ? ` · ${formatCNPJ(empresa.cnpj)}`
                            : ` · ${formatCNPJ(empresa.cnpj)}`}
                        </p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                          {empresa.cidade && empresa.uf && (
                            <span>{empresa.cidade}/{empresa.uf}</span>
                          )}
                          {empresa.grauRisco && <span>Grau de risco: {empresa.grauRisco}</span>}
                          <span>{empresa._count.colaboradores} colaborador(es)</span>
                          <span>{empresa._count.pgrs} PGR(s)</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:ml-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          empresa.ativo
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {empresa.ativo ? "Ativa" : "Inativa"}
                      </span>
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
