import Link from "next/link";
import { notFound } from "next/navigation";
import { getPCMSO } from "@/app/actions/pcmso";
import { PrintButton } from "@/components/print-button";
import { labelGrauRisco } from "@/lib/pgr-nr1";
import { formatCNPJ, formatDate } from "@/lib/utils";
import { TIPO_RISCO_LABELS } from "@/types";

export const dynamic = "force-dynamic";

export default async function PCMSODocumentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pcmso = await getPCMSO(id);
  if (!pcmso) notFound();

  const emp = pcmso.empresa;
  const riscosPgr =
    pcmso.pgr?.inventarioItens.map((i) => ({
      nome: i.risco.nome,
      tipo: i.risco.tipo,
      setor: i.setorNome,
      nivel: i.nivelRisco,
    })) || [];

  return (
    <div className="min-h-screen bg-white text-black p-6 md:p-10 print:p-6">
      <style>{`@media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; } }`}</style>

      <div className="no-print mb-6 flex flex-wrap gap-3">
        <PrintButton label="Imprimir / PDF do PCMSO" />
        <Link href={`/pcmso/${id}`} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-slate-50">
          Voltar
        </Link>
      </div>

      <div className="max-w-4xl mx-auto border-2 border-slate-800">
        <header className="bg-emerald-900 text-white px-6 py-5 text-center">
          <h1 className="text-xl md:text-2xl font-bold tracking-wide">
            PROGRAMA DE CONTROLE MÉDICO DE SAÚDE OCUPACIONAL — PCMSO
          </h1>
          <p className="text-sm mt-1 opacity-90">Norma Regulamentadora NR-7 · MTE</p>
          <p className="text-xs mt-1 opacity-75">
            {pcmso.titulo} · Versão {pcmso.versao} · {formatDate(pcmso.dataElaboracao)}
          </p>
        </header>

        <section className="px-6 py-5 border-b border-slate-300">
          <h2 className="font-bold text-sm uppercase tracking-wide border-b pb-1 mb-3">
            1. Identificação da organização
          </h2>
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            <p><strong>Razão social:</strong> {emp.razaoSocial}</p>
            <p><strong>CNPJ:</strong> {formatCNPJ(emp.cnpj)}</p>
            <p><strong>CNAE:</strong> {emp.cnae || "—"}</p>
            <p><strong>Grau de risco (NR-4):</strong> {labelGrauRisco(emp.grauRisco)}</p>
            <p className="sm:col-span-2">
              <strong>Endereço:</strong>{" "}
              {[emp.endereco, emp.cidade, emp.uf, emp.cep].filter(Boolean).join(", ") || "—"}
            </p>
          </div>
        </section>

        <section className="px-6 py-5 border-b border-slate-300">
          <h2 className="font-bold text-sm uppercase tracking-wide border-b pb-1 mb-3">
            2. Vínculo com o PGR
          </h2>
          <p className="text-sm">
            {pcmso.pgr
              ? `${pcmso.pgr.titulo} (riscos do inventário incorporados ao PCMSO)`
              : "PCMSO sem PGR vinculado — recomenda-se vincular ao inventário de riscos."}
          </p>
          {riscosPgr.length > 0 && (
            <ul className="mt-2 text-xs space-y-1">
              {riscosPgr.map((r, i) => (
                <li key={i}>
                  • {r.nome} ({TIPO_RISCO_LABELS[r.tipo]})
                  {r.setor ? ` — ${r.setor}` : ""}
                  {r.nivel ? ` · ${r.nivel}` : ""}
                </li>
              ))}
            </ul>
          )}
        </section>

        {(pcmso.objetivos || pcmso.diretrizes) && (
          <section className="px-6 py-5 border-b border-slate-300">
            <h2 className="font-bold text-sm uppercase tracking-wide border-b pb-1 mb-3">
              3. Objetivos e diretrizes
            </h2>
            {pcmso.objetivos && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-slate-500">Objetivos</p>
                <p className="text-sm whitespace-pre-wrap">{pcmso.objetivos}</p>
              </div>
            )}
            {pcmso.diretrizes && (
              <div>
                <p className="text-xs font-semibold text-slate-500">Diretrizes</p>
                <p className="text-sm whitespace-pre-wrap">{pcmso.diretrizes}</p>
              </div>
            )}
          </section>
        )}

        <section className="px-6 py-5 border-b border-slate-300">
          <h2 className="font-bold text-sm uppercase tracking-wide border-b pb-1 mb-3">
            4. Quadro de exames (NR-7)
          </h2>
          {pcmso.exames.length === 0 ? (
            <p className="text-sm text-slate-600">Nenhum exame definido.</p>
          ) : (
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-400 text-left">
                  <th className="p-1.5">Exame</th>
                  <th className="p-1.5">Tipo (NR-7)</th>
                  <th className="p-1.5">Periodicidade</th>
                  <th className="p-1.5">Setores / funções</th>
                </tr>
              </thead>
              <tbody>
                {pcmso.exames.map((ex) => (
                  <tr key={ex.id} className="border-b border-slate-200">
                    <td className="p-1.5 font-medium">{ex.nomeExame}</td>
                    <td className="p-1.5">{ex.tipo}</td>
                    <td className="p-1.5">{ex.periodicidade || "—"}</td>
                    <td className="p-1.5">
                      {[ex.setoresAplicaveis, ex.funcoesAplicaveis].filter(Boolean).join(" / ") ||
                        "Geral"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="px-6 py-5">
          <h2 className="font-bold text-sm uppercase tracking-wide border-b pb-1 mb-3">
            5. Médico coordenador / responsável
          </h2>
          <div className="text-sm space-y-1">
            <p>
              <strong>Nome:</strong>{" "}
              {pcmso.medicoCoordenador?.nome ||
                pcmso.responsavelNome ||
                "_______________________________"}
            </p>
            <p>
              <strong>CRM:</strong>{" "}
              {pcmso.medicoCoordenador
                ? `${pcmso.medicoCoordenador.crm}/${pcmso.medicoCoordenador.crmUf}`
                : pcmso.responsavelCrm || "_______________________________"}
            </p>
            <div className="mt-10 border-t border-slate-800 w-48 pt-1 text-xs text-slate-500">
              Assinatura e carimbo
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-300 px-6 py-3 text-[10px] text-slate-500 text-center">
          SGS · PCMSO conforme NR-7/MTE · Dados da empresa e riscos do PGR incorporados automaticamente
        </footer>
      </div>
    </div>
  );
}
