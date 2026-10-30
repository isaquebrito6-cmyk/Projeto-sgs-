import Link from "next/link";
import { Plus, Hospital, UserCheck, ClipboardList } from "lucide-react";
import { listClinicas } from "@/app/actions/clinicas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCNPJ } from "@/lib/utils";

export default async function ClinicasPage() {
  const clinicas = await listClinicas();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Clínicas</h1>
          <p className="text-slate-500 mt-1">
            Clínicas e médicos que realizam exames ocupacionais
          </p>
        </div>
        <Link href="/clinicas/nova">
          <Button className="bg-sgs-700 hover:bg-sgs-800">
            <Plus className="w-4 h-4" />
            Nova clínica
          </Button>
        </Link>
      </div>

      {clinicas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-sgs-100 flex items-center justify-center mb-4">
              <Hospital className="w-7 h-7 text-sgs-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Nenhuma clínica cadastrada</h3>
            <p className="text-slate-500 mt-1 max-w-sm">
              Cadastre clínicas parceiras para solicitar exames e receber ASOs.
            </p>
            <Link href="/clinicas/nova" className="mt-6">
              <Button className="bg-sgs-700 hover:bg-sgs-800">
                <Plus className="w-4 h-4" />
                Cadastrar clínica
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {clinicas.map((clinica) => (
            <Link key={clinica.id} href={`/clinicas/${clinica.id}`}>
              <Card className="hover:shadow-md transition cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                        <Hospital className="w-5 h-5 text-teal-700" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {clinica.nomeFantasia || clinica.razaoSocial}
                        </h3>
                        {clinica.nomeFantasia && (
                          <p className="text-sm text-slate-500">{clinica.razaoSocial}</p>
                        )}
                        <p className="text-sm text-slate-500 mt-0.5">
                          CNPJ: {formatCNPJ(clinica.cnpj)}
                          {clinica.cidade && clinica.uf && (
                            <> · {clinica.cidade}/{clinica.uf}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4" />
                        {clinica._count.medicos} médico(s)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <ClipboardList className="w-4 h-4" />
                        {clinica._count.asos} ASO(s)
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
