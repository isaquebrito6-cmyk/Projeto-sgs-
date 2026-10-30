import { listEmpresas } from "@/app/actions/empresas";
import { listColaboradores } from "@/app/actions/colaboradores";
import { listClinicas } from "@/app/actions/clinicas";
import { SolicitacaoForm } from "@/components/forms/solicitacao-form";

export default async function NovaSolicitacaoPage() {
  const [empresas, colaboradores, clinicas] = await Promise.all([
    listEmpresas(),
    listColaboradores(),
    listClinicas(),
  ]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Solicitar exame ocupacional</h1>
        <p className="text-slate-500 mt-1">
          Conforme NR-7 — exames admissionais, periódicos, retorno, mudança de risco e demissionais
        </p>
      </div>
      <SolicitacaoForm
        empresas={empresas}
        colaboradores={colaboradores.map((c) => ({
          id: c.id,
          nome: c.nome,
          cpf: c.cpf,
          empresaId: c.empresaId,
          funcaoNome: c.funcao?.nome || null,
        }))}
        clinicas={clinicas}
      />
    </div>
  );
}
