import { notFound } from "next/navigation";
import { getColaborador } from "@/app/actions/colaboradores";
import { listEmpresas } from "@/app/actions/empresas";
import { ColaboradorForm } from "@/components/forms/colaborador-form";

export default async function EditarColaboradorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [colab, empresas] = await Promise.all([getColaborador(id), listEmpresas()]);

  if (!colab) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Editar colaborador</h1>
        <p className="text-slate-500 mt-1">{colab.nome}</p>
      </div>
      <ColaboradorForm empresas={empresas} colaborador={colab} />
    </div>
  );
}
