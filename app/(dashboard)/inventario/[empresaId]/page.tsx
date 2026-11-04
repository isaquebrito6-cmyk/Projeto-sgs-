import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Stethoscope, AlertTriangle } from "lucide-react";
import { getInventarioEmpresa } from "@/app/actions/inventario";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InventarioIndependente } from "@/components/inventario-independente";
import { formatCNPJ } from "@/lib/utils";
import { labelGrauRisco } from "@/lib/pgr-nr1";

export const dynamic = "force-dynamic";

export default async function InventarioEmpresaPage({
  params,
}: {
  params: Promise<{ empresaId: string }>;
}) {
  const { empresaId } = await params;
  const data = await getInventarioEmpresa(empresaId);
  if (!data) notFound();

  const emp = data.empresa;
  const setores = emp.setores || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/inventario">
            <Button variant="ghost" size="icon" className="mt-0.5">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
              Inventário de Riscos
            </h1>
            <p className="text-slate-500 mt-1">
              {emp.nomeFantasia || emp.razaoSocial} · CNPJ {formatCNPJ(emp.cnpj)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/pgr/${data.id}`}>
            <Button variant="outline">
              <FileText className="w-4 h-4" /> Ver PGR vinculado
            </Button>
          </Link>
          {data.pcmso ? (
            <Link href={`/pcmso/${data.pcmso.id}`}>
              <Button variant="outline">
                <Stethoscope className="w-4 h-4" /> Ver PCMSO
              </Button>
            </Link>
          ) : (
            <Link href={`/pcmso/novo?pgrId=${data.id}&empresaId=${empresaId}`}>
              <Button
                variant="outline"
                disabled={data.inventarioItens.length === 0}
                className="disabled:opacity-50"
              >
                <Stethoscope className="w-4 h-4" /> Gerar PCMSO
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Card className="border-sgs-200 bg-sgs-50/40">
        <CardContent className="p-4 text-sm text-slate-700 space-y-1">
          <p>
            <strong>Como funciona:</strong> este formulário é independente. Cada risco adicionado
            entra no <strong>PGR</strong> da empresa (criado automaticamente se ainda não existir),
            alimenta o <strong>PCMSO</strong> e aparece nas <strong>solicitações de exame / ASO</strong>.
          </p>
          <p className="text-xs text-slate-500">
            PGR atual: <strong>{data.titulo}</strong> (v{data.versao}) · Grau de risco:{" "}
            {labelGrauRisco(emp.grauRisco)} · {data.inventarioItens.length} risco(s) no inventário
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Empresa e estrutura</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-2 text-sm">
          <p>
            <span className="text-slate-500">CNAE:</span> {emp.cnae || "—"}
          </p>
          <p>
            <span className="text-slate-500">Grau de risco:</span> {labelGrauRisco(emp.grauRisco)}
          </p>
          <p className="sm:col-span-2">
            <span className="text-slate-500">Setores:</span>{" "}
            {setores.length
              ? setores
                  .map(
                    (s) =>
                      `${s.nome} (${s._count.colaboradores} colab.; ${s.funcoes.length} funç.; ${s.ghes.length} GHE)`
                  )
                  .join(" · ")
              : "Cadastre setores na empresa para facilitar o inventário"}
          </p>
        </CardContent>
      </Card>

      <InventarioIndependente
        empresaId={empresaId}
        pgrId={data.id}
        itens={data.inventarioItens}
        setores={setores}
      />
    </div>
  );
}
