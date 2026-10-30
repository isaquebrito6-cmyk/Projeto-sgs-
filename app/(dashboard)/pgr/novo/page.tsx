import { listEmpresas } from "@/app/actions/empresas";
import { PGRForm } from "@/components/forms/pgr-form";

export default async function NovoPGRPage() {
  const empresas = await listEmpresas();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Novo PGR</h1>
        <p className="text-slate-500 mt-1">
          Programa de Gerenciamento de Riscos conforme NR-1 e NR-9
        </p>
      </div>
      <PGRForm empresas={empresas} />
    </div>
  );
}
