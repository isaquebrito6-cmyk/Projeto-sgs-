import Link from "next/link";
import { Plus, Building2, Users, FileText, Search } from "lucide-react";
import { listEmpresas } from "@/app/actions/empresas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCNPJ } from "@/lib/utils";

export default async function EmpresasPage() {
  const empresas = await listEmpresas();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Empresas</h1>
          <p className="text-slate-500 mt-1">
            Gerencie as empresas cadastradas no sistema
          </p>
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
            <div className="w-14 h-14 rounded-full bg-sgs-100 flex items-center justify-center mb-4">
              <Building2 className="w-7 h-7 text-sgs-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Nenhuma empresa cadastrada</h3>
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
                        {empresa.nomeFantasia && (
                          <p className="text-sm text-slate-500">{empresa.razaoSocial}</p>
                        )}
                        <p className="text-sm text-slate-500 mt-0.5">
                          CNPJ: {formatCNPJ(empresa.cnpj)}
                          {empresa.cidade && empresa.uf && (
                            <> · {empresa.cidade}/{empresa.uf}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 sm:pr-2">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        {empresa._count.colaboradores}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4" />
                        {empresa._count.pgrs} PGR
                      </span>
                      {empresa.grauRisco && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium">
                          Grau {empresa.grauRisco}
                        </span>
                      )}
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
