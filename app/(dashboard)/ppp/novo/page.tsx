import Link from "next/link";
import { listEmpresas } from "@/app/actions/empresas";
import { listColaboradores } from "@/app/actions/colaboradores";
import { PppForm } from "@/components/forms/ppp-form";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function NovoPppPage() {
  const [empresas, colaboradores] = await Promise.all([listEmpresas(), listColaboradores()]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Novo PPP</h1>
          <p className="text-slate-500 mt-1">Perfil Profissiográfico Previdenciário</p>
        </div>
        <Link href="/ppp">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>
      <PppForm empresas={empresas} colaboradores={colaboradores} />
    </div>
  );
}
