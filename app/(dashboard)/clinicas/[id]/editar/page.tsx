import { notFound } from "next/navigation";
import { getClinica } from "@/app/actions/clinicas";
import { ClinicaForm } from "@/components/forms/clinica-form";

export default async function EditarClinicaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const clinica = await getClinica(id);
  if (!clinica) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Editar clínica</h1>
        <p className="text-slate-500 mt-1">{clinica.razaoSocial}</p>
      </div>
      <ClinicaForm clinica={clinica} />
    </div>
  );
}
