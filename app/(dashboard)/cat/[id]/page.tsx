import Link from "next/link";
import { notFound } from "next/navigation";
import { getCAT } from "@/app/actions/operacional";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrintButton } from "@/components/print-button";
import { formatCPF, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cat = await getCAT(id);
  if (!cat) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <p className="text-sm text-amber-800 font-medium">CAT · {cat.tipo}</p>
          <h1 className="text-2xl font-bold text-slate-900">{cat.colaborador.nome}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {cat.empresa.nomeFantasia || cat.empresa.razaoSocial} · {formatDate(cat.dataAcidente)}
          </p>
        </div>
        <div className="flex gap-2">
          <PrintButton label="Imprimir / PDF" />
          <Link href="/cat">
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>
      </div>

      <Card className="border-amber-200">
        <CardHeader className="border-b bg-amber-50/80">
          <CardTitle className="text-base">Comunicação de Acidente de Trabalho</CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Empresa</p>
            <p className="font-medium">{cat.empresa.razaoSocial}</p>
            <p className="text-xs text-slate-500">CNPJ {cat.empresa.cnpj}</p>
          </div>
          <div>
            <p className="text-slate-500">Trabalhador</p>
            <p className="font-medium">{cat.colaborador.nome}</p>
            <p className="text-xs text-slate-500">CPF {formatCPF(cat.colaborador.cpf)}</p>
          </div>
          <div>
            <p className="text-slate-500">Função / Setor</p>
            <p className="font-medium">
              {cat.colaborador.funcao?.nome || "—"}
              {cat.colaborador.setor ? ` · ${cat.colaborador.setor.nome}` : ""}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Data e hora</p>
            <p className="font-medium">
              {formatDate(cat.dataAcidente)}
              {cat.horaAcidente ? ` · ${cat.horaAcidente}` : ""}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-slate-500">Local</p>
            <p className="font-medium">{cat.localAcidente || "—"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-slate-500">Descrição</p>
            <p className="font-medium whitespace-pre-wrap">{cat.descricao}</p>
          </div>
          <div>
            <p className="text-slate-500">Parte do corpo</p>
            <p className="font-medium">{cat.parteCorpoAtingida || "—"}</p>
          </div>
          <div>
            <p className="text-slate-500">Agente causador</p>
            <p className="font-medium">{cat.agenteCausador || "—"}</p>
          </div>
          <div>
            <p className="text-slate-500">Afastamento</p>
            <p className="font-medium">{cat.houveAfastamento ? "Sim" : "Não"}</p>
          </div>
          <div>
            <p className="text-slate-500">Emitido por</p>
            <p className="font-medium">{cat.emitidoPor || "—"}</p>
          </div>
          {cat.testemunhas && (
            <div className="sm:col-span-2">
              <p className="text-slate-500">Testemunhas</p>
              <p className="font-medium">{cat.testemunhas}</p>
            </div>
          )}
          {cat.observacoes && (
            <div className="sm:col-span-2">
              <p className="text-slate-500">Observações</p>
              <p className="font-medium">{cat.observacoes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-slate-400 print:hidden">
        Registro interno do SGS. A CAT oficial deve ser transmitida pelo eSocial / sistemas da
        Previdência conforme legislação vigente.
      </p>
    </div>
  );
}
