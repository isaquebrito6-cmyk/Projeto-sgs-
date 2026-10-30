import { listEmpresas } from "@/app/actions/empresas";
import { ColaboradorForm } from "@/components/forms/colaborador-form";

export default async function NovoColaboradorPage() {
  const empresas = await listEmpresas();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Novo colaborador</h1>
        <p className="text-slate-500 mt-1">Cadastre um colaborador e vincule a setor e função</p>
      </div>
      <ColaboradorForm empresas={empresas} />
    </div>
  );
}
