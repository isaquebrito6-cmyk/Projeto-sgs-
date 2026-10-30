import { listEmpresas } from "@/app/actions/empresas";
import { listPGRs } from "@/app/actions/pgr";
import { PCMSOForm } from "@/components/forms/pcmso-form";

export default async function NovoPCMSOPage({
  searchParams,
}: {
  searchParams: Promise<{ pgrId?: string; empresaId?: string }>;
}) {
  const params = await searchParams;
  const [empresas, pgrs] = await Promise.all([listEmpresas(), listPGRs()]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Novo PCMSO</h1>
        <p className="text-slate-500 mt-1">
          Programa de Controle Médico de Saúde Ocupacional conforme NR-7
        </p>
      </div>
      <PCMSOForm
        empresas={empresas}
        pgrs={pgrs.map((p) => ({
          id: p.id,
          titulo: p.titulo,
          empresaId: p.empresa.id,
          empresaNome: p.empresa.nomeFantasia || p.empresa.razaoSocial,
        }))}
        defaultPgrId={params.pgrId}
        defaultEmpresaId={params.empresaId}
      />
    </div>
  );
}
