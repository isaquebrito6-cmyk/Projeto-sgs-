import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, User, Building2, Briefcase, Calendar, IdCard } from "lucide-react";
import { getColaborador } from "@/app/actions/colaboradores";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCPF, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ColaboradorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const colab = await getColaborador(id);

  if (!colab) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/colaboradores">
            <Button variant="ghost" size="icon" className="mt-0.5">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-start gap-3">
            <div className="w-16 h-20 rounded border bg-slate-100 overflow-hidden shrink-0">
              {colab.fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={colab.fotoUrl} alt={colab.nome} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-400">
                  Sem foto
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{colab.nome}</h1>
              <p className="text-slate-500 mt-1">CPF: {formatCPF(colab.cpf)}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/colaboradores/${id}/carteirinha`}>
            <Button variant="outline">
              <IdCard className="w-4 h-4" />
              Carteirinha
            </Button>
          </Link>
          <Link href={`/colaboradores/${id}/editar`}>
            <Button variant="outline">
              <Pencil className="w-4 h-4" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-4 h-4" /> Dados pessoais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Nome completo</dt>
                <dd className="font-medium">{colab.nome}</dd>
              </div>
              <div>
                <dt className="text-slate-500">CPF</dt>
                <dd className="font-medium">{formatCPF(colab.cpf)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Data de nascimento</dt>
                <dd className="font-medium">{formatDate(colab.dataNascimento)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Sexo</dt>
                <dd className="font-medium">
                  {colab.sexo === "M"
                    ? "Masculino"
                    : colab.sexo === "F"
                      ? "Feminino"
                      : colab.sexo || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">E-mail</dt>
                <dd className="font-medium">{colab.email || "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Telefone</dt>
                <dd className="font-medium">{colab.telefone || "—"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Dados profissionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> Empresa
                </dt>
                <dd className="font-medium">
                  <Link href={`/empresas/${colab.empresaId}`} className="text-sgs-700 hover:underline">
                    {colab.empresa.nomeFantasia || colab.empresa.razaoSocial}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Setor</dt>
                <dd className="font-medium">{colab.setor?.nome || "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Função</dt>
                <dd className="font-medium">{colab.funcao?.nome || "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Data de admissão
                </dt>
                <dd className="font-medium">{formatDate(colab.dataAdmissao)}</dd>
              </div>
              {colab.dataDemissao && (
                <div>
                  <dt className="text-slate-500">Data de demissão</dt>
                  <dd className="font-medium">{formatDate(colab.dataDemissao)}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico de ASOs</CardTitle>
        </CardHeader>
        <CardContent>
          {colab.asos.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum ASO registrado ainda.</p>
          ) : (
            <div className="space-y-2">
              {colab.asos.map((aso) => (
                <div
                  key={aso.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 text-sm"
                >
                  <span>
                    {formatDate(aso.dataEmissao)} — {aso.conclusao}
                  </span>
                  <span className="text-slate-500">{aso.funcaoColaborador}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
