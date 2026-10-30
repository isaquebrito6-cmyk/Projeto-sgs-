import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Hospital, UserCheck, ClipboardList, MapPin, Phone, Mail } from "lucide-react";
import { getClinica } from "@/app/actions/clinicas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClinicaMedicos } from "@/components/clinica-medicos";
import { formatCNPJ } from "@/lib/utils";

export default async function ClinicaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const clinica = await getClinica(id);

  if (!clinica) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/clinicas">
            <Button variant="ghost" size="icon" className="mt-0.5">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              {clinica.nomeFantasia || clinica.razaoSocial}
            </h1>
            {clinica.nomeFantasia && (
              <p className="text-slate-500">{clinica.razaoSocial}</p>
            )}
            <p className="text-sm text-slate-500 mt-1">CNPJ: {formatCNPJ(clinica.cnpj)}</p>
          </div>
        </div>
        <Link href={`/clinicas/${id}/editar`}>
          <Button variant="outline">
            <Pencil className="w-4 h-4" />
            Editar
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <p className="text-2xl font-bold">{clinica._count.medicos}</p>
              <p className="text-sm text-slate-500">Médicos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-violet-700" />
            </div>
            <div>
              <p className="text-2xl font-bold">{clinica._count.asos}</p>
              <p className="text-sm text-slate-500">ASOs emitidos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Hospital className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="text-2xl font-bold">{clinica._count.solicitacoesExame}</p>
              <p className="text-sm text-slate-500">Solicitações</p>
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
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Razão Social</dt>
                <dd className="font-medium">{clinica.razaoSocial}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Nome Fantasia</dt>
                <dd className="font-medium">{clinica.nomeFantasia || "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">CNPJ</dt>
                <dd className="font-medium">{formatCNPJ(clinica.cnpj)}</dd>
              </div>
              <div>
                <dt className="text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Endereço
                </dt>
                <dd className="font-medium">
                  {clinica.endereco
                    ? `${clinica.endereco}${clinica.cidade ? `, ${clinica.cidade}` : ""}${clinica.uf ? `/${clinica.uf}` : ""}`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Telefone
                </dt>
                <dd className="font-medium">{clinica.telefone || "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> E-mail
                </dt>
                <dd className="font-medium">{clinica.email || "—"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <ClinicaMedicos clinicaId={id} medicos={clinica.medicos} />
      </div>
    </div>
  );
}
