import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, FolderOpen } from "lucide-react";
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

  const pastaEmpresa = t.empresa.pastaTreinamentosUrl;
  const material = t.materialUrl;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 print:hidden">
        <div>
          <p className="text-sm text-sgs-700 font-medium">{t.tipo}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t.titulo}</h1>
          <p className="text-slate-500 mt-1">
            {t.empresa.nomeFantasia || t.empresa.razaoSocial}
            {t.dataRealizacao && <> · {formatDate(t.dataRealizacao)}</>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {material && (
            <a href={material} target="_blank" rel="noopener noreferrer">
              <Button className="bg-sgs-700 hover:bg-sgs-800">
                <ExternalLink className="w-4 h-4" />
                Abrir material
              </Button>
            </a>
          )}
          {pastaEmpresa && (
            <a href={pastaEmpresa} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                <FolderOpen className="w-4 h-4" />
                Pasta da empresa
              </Button>
            </a>
          )}
          <Link href={`/treinamentos/${id}/certificados`}>
            <Button variant="outline">Certificados</Button>
          </Link>
          <Link href={`/treinamentos/${id}/lista-presenca`}>
            <Button variant="outline">Lista de presença</Button>
          </Link>
          <Link href="/treinamentos">
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>
      </div>

      {!material && !pastaEmpresa && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 print:hidden">
          Nenhum material vinculado. Configure em{" "}
          <Link href="/treinamentos/materiais" className="underline font-medium">
            Treinamentos → Materiais / pasta
          </Link>
          .
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do treinamento</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-3 text-sm">
          <p>
            <span className="text-slate-500">Instrutor / resp. técnico:</span> {t.instrutor || "—"}
          </p>
          <p>
            <span className="text-slate-500">Local:</span> {t.local || "—"}
          </p>
          <p>
            <span className="text-slate-500">Carga horária:</span>{" "}
            {t.cargaHoraria != null ? `${t.cargaHoraria}h` : "—"}
          </p>
          <p>
            <span className="text-slate-500">Validade / próximo periódico:</span>{" "}
            {t.validade ? formatDate(t.validade) : "—"}
          </p>
          {t.conteudo && (
            <p className="sm:col-span-2">
              <span className="text-slate-500">Conteúdo programático:</span> {t.conteudo}
            </p>
          )}
          {t.observacoes && (
            <p className="sm:col-span-2">
              <span className="text-slate-500">Observações:</span> {t.observacoes}
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
