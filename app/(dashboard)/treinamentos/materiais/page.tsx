import Link from "next/link";
import { listMateriais } from "@/app/actions/materiais-treinamento";
import { MateriaisTreinamentoPanel } from "@/components/forms/materiais-treinamento-form";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function MateriaisTreinamentoPage() {
  const empresas = await listMateriais();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Materiais de treinamento</h1>
          <p className="text-slate-500 mt-1">
            Pasta na nuvem e links por NR (Drive, OneDrive, Dropbox)
          </p>
        </div>
        <Link href="/treinamentos">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>

      <MateriaisTreinamentoPanel empresas={empresas} />
    </div>
  );
}
