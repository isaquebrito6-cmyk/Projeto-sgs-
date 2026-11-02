import Link from "next/link";
import { listEmpresas } from "@/app/actions/empresas";
import { listColaboradores } from "@/app/actions/colaboradores";
import { TreinamentoForm } from "@/components/forms/treinamento-form";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function NovoTreinamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ catalogo?: string }>;
}) {
  const sp = await searchParams;
  const [empresas, colaboradores] = await Promise.all([
    listEmpresas(),
    listColaboradores(),
  ]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Novo treinamento / DDS</h1>
          <p className="text-slate-500 mt-1">Registre a atividade e selecione os participantes</p>
        </div>
        <Link href="/treinamentos">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>
      <TreinamentoForm
        empresas={empresas}
        colaboradores={colaboradores}
        catalogoInicial={sp.catalogo}
      />
    </div>
  );
}
