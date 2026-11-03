import Link from "next/link";
import { listEmpresas } from "@/app/actions/empresas";
import { listColaboradores } from "@/app/actions/colaboradores";
import { PtForm } from "@/components/forms/pt-form";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function NovaPtPage() {
  const [empresas, colaboradores] = await Promise.all([listEmpresas(), listColaboradores()]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nova Permissão de Trabalho</h1>
          <p className="text-slate-500 mt-1">PT para atividades com controle operacional</p>
        </div>
        <Link href="/pt">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>
      <PtForm empresas={empresas} colaboradores={colaboradores} />
    </div>
  );
}
