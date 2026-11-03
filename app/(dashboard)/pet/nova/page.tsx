import Link from "next/link";
import { listEmpresas } from "@/app/actions/empresas";
import { PetForm } from "@/components/forms/pet-form";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function NovaPetPage() {
  const empresas = await listEmpresas();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nova PET (NR-33)</h1>
          <p className="text-slate-500 mt-1">Permissão de Entrada e Trabalho — espaço confinado</p>
        </div>
        <Link href="/pet">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>
      <PetForm empresas={empresas} />
    </div>
  );
}
