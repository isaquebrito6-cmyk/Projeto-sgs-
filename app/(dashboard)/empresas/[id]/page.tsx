import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Users, FileText, MapPin, Phone, Mail, Building2 } from "lucide-react";
import { getEmpresa } from "@/app/actions/empresas";
import { listSetores } from "@/app/actions/setores";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmpresaSetores } from "@/components/empresa-setores";
import { formatCNPJ } from "@/lib/utils";

export default async function EmpresaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [empresa, setores] = await Promise.all([getEmpresa(id), listSetores(id)]);

  if (!empresa) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/empresas">
            <Button variant="ghost" size="icon" className="mt-0.5">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              {empresa.nomeFantasia || empresa.razaoSocial}
            </h1>
            {empresa.nomeFantasia && (
              <p className="text-slate-500">{empresa.razaoSocial}</p>
            )}
            <p className="text-sm text-slate-500 mt-1">CNPJ: {formatCNPJ(empresa.cnpj)}</p>
          </div>
        </div>
        <Link href={`/empresas/${id}/editar`}>
          <Button variant="outline">
            <Pencil className="w-4 h-4" />
            Editar
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <p className="text-2xl font-bold">{empresa._count.colaboradores}</p>
              <p className="text-sm text-slate-500">Colaboradores</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-violet-700" />
            </div>
            <div>
              <p className="text-2xl font-bold">{empresa._count.pgrs}</p>
              <p className="text-sm text-slate-500">PGRs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-2xl font-bold">{empresa._count.setores}</p>
              <p className="text-sm text-slate-500">Setores</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados cadastrais</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <dt className="text-slate-500">Razão Social</dt>
                <dd className="font-medium mt-0.5">{empresa.razaoSocial}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Nome Fantasia</dt>
                <dd className="font-medium mt-0.5">{empresa.nomeFantasia || "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">CNPJ</dt>
                <dd className="font-medium mt-0.5">{formatCNPJ(empresa.cnpj)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Inscrição Estadual</dt>
                <dd className="font-medium mt-0.5">{empresa.inscricaoEstadual || "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">CNAE</dt>
                <dd className="font-medium mt-0.5">{empresa.cnae || "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Grau de Risco (NR-4)</dt>
                <dd className="font-medium mt-0.5">
                  {empresa.grauRisco ? `Grau ${empresa.grauRisco}` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Nº de Funcionários</dt>
                <dd className="font-medium mt-0.5">{empresa.numeroFuncionarios ?? "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Endereço
                </dt>
                <dd className="font-medium mt-0.5">
                  {empresa.endereco
                    ? `${empresa.endereco}${empresa.cidade ? `, ${empresa.cidade}` : ""}${empresa.uf ? `/${empresa.uf}` : ""}${empresa.cep ? ` — CEP ${empresa.cep}` : ""}`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Telefone
                </dt>
                <dd className="font-medium mt-0.5">{empresa.telefone || "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> E-mail
                </dt>
                <dd className="font-medium mt-0.5">{empresa.email || "—"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <EmpresaSetores empresaId={id} setores={setores} />
      </div>
    </div>
  );
}
