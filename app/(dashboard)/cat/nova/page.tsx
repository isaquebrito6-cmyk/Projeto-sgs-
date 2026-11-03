import Link from "next/link";
import { listEmpresas } from "@/app/actions/empresas";
import { listColaboradores } from "@/app/actions/colaboradores";
import { CatForm } from "@/components/forms/cat-form";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function NovaCatPage() {
  const [empresas, colaboradores] = await Promise.all([
    listEmpresas(),
    listColaboradores(),
  ]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Nova CAT</h1>
          <p className="text-slate-500 mt-1">Comunicação de Acidente de Trabalho</p>
        </div>
        <Link href="/cat">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>
      <CatForm empresas={empresas} colaboradores={colaboradores} />
    </div>
  );
}
