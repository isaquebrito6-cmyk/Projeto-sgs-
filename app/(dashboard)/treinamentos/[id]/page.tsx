import Link from "next/link";
import { notFound } from "next/navigation";
import { getTreinamento } from "@/app/actions/treinamentos";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatCPF } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TreinamentoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTreinamento(id);
  if (!t) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-sm text-sgs-700 font-medium">{t.tipo}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t.titulo}</h1>
          <p className="text-slate-500 mt-1">
            {t.empresa.nomeFantasia || t.empresa.razaoSocial}
            {t.dataRealizacao && <> · {formatDate(t.dataRealizacao)}</>}
          </p>
        </div>
        <Link href="/treinamentos">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-3 text-sm">
          <p>
            <span className="text-slate-500">Instrutor:</span> {t.instrutor || "—"}
          </p>
          <p>
            <span className="text-slate-500">Local:</span> {t.local || "—"}
          </p>
          <p>
            <span className="text-slate-500">Carga horária:</span>{" "}
            {t.cargaHoraria != null ? `${t.cargaHoraria}h` : "—"}
          </p>
          <p>
            <span className="text-slate-500">Validade:</span>{" "}
            {t.validade ? formatDate(t.validade) : "—"}
          </p>
          {t.conteudo && (
            <p className="sm:col-span-2">
              <span className="text-slate-500">Conteúdo:</span> {t.conteudo}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Participantes ({t.participantes.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {t.participantes.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum participante vinculado.</p>
          ) : (
            t.participantes.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{p.colaborador.nome}</p>
                  <p className="text-xs text-slate-500">
                    CPF {formatCPF(p.colaborador.cpf)}
                    {p.colaborador.funcao && <> · {p.colaborador.funcao.nome}</>}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium ${
                    p.presente ? "text-emerald-700" : "text-slate-400"
                  }`}
                >
                  {p.presente ? "Presente" : "Ausente"}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
