import { notFound } from "next/navigation";
import { getEmpresa } from "@/app/actions/empresas";
import { EmpresaForm } from "@/components/forms/empresa-form";

export default async function EditarEmpresaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const empresa = await getEmpresa(id);

  if (!empresa) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Editar empresa</h1>
        <p className="text-slate-500 mt-1">{empresa.razaoSocial}</p>
      </div>
      <EmpresaForm empresa={empresa} />
    </div>
  );
}
