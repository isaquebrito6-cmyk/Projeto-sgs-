import Link from "next/link";
import { notFound } from "next/navigation";
import { getPGR } from "@/app/actions/pgr";
import { PrintButton } from "@/components/print-button";
import { labelGrauRisco } from "@/lib/pgr-nr1";
import { formatCNPJ, formatDate } from "@/lib/utils";
import { TIPO_RISCO_LABELS, NIVEL_RISCO_LABELS } from "@/types";

export const dynamic = "force-dynamic";

export default async function PGRDocumentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pgr = await getPGR(id);
  if (!pgr) notFound();

  const emp = pgr.empresa;
  const setores = emp.setores || [];

  return (
    <div className="min-h-screen bg-white text-black p-6 md:p-10 print:p-6">
      <style>{`@media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; } .break-page { break-before: page; } }`}</style>

      <div className="no-print mb-6 flex flex-wrap gap-3">
        <PrintButton label="Imprimir / PDF do PGR" />
        <Link href={`/pgr/${id}`} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-slate-50">
          Voltar
        </Link>
      </div>

      <div className="max-w-4xl mx-auto border-2 border-slate-800">
        <header className="bg-slate-800 text-white px-6 py-5 text-center">
          <h1 className="text-xl md:text-2xl font-bold tracking-wide">
            PROGRAMA DE GERENCIAMENTO DE RISCOS — PGR
          </h1>
          <p className="text-sm mt-1 opacity-90">
            Norma Regulamentadora NR-1 (GRO/PGR) · Ministério do Trabalho e Emprego
          </p>
          <p className="text-xs mt-1 opacity-75">
            {pgr.titulo} · Versão {pgr.versao} · {formatDate(pgr.dataElaboracao)}
          </p>
        </header>

        <section className="px-6 py-5 border-b border-slate-300">
          <h2 className="font-bold text-sm uppercase tracking-wide border-b border-slate-300 pb-1 mb-3">
            1. Identificação da organização
          </h2>
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            <p><strong>Razão social:</strong> {emp.razaoSocial}</p>
            <p><strong>Nome fantasia:</strong> {emp.nomeFantasia || "—"}</p>
            <p><strong>CNPJ:</strong> {formatCNPJ(emp.cnpj)}</p>
            <p><strong>CNAE:</strong> {emp.cnae || "—"}</p>
            <p><strong>Grau de risco (NR-4):</strong> {labelGrauRisco(emp.grauRisco)}</p>
            <p><strong>Nº de trabalhadores:</strong> {emp.numeroFuncionarios ?? "—"}</p>
            <p className="sm:col-span-2">
              <strong>Endereço:</strong>{" "}
              {[emp.endereco, emp.cidade, emp.uf, emp.cep].filter(Boolean).join(", ") || "—"}
            </p>
            {emp.telefone && <p><strong>Telefone:</strong> {emp.telefone}</p>}
            {emp.email && <p><strong>E-mail:</strong> {emp.email}</p>}
          </div>
        </section>

        <section className="px-6 py-5 border-b border-slate-300">
          <h2 className="font-bold text-sm uppercase tracking-wide border-b border-slate-300 pb-1 mb-3">
            2. Setores, funções e GHE
          </h2>
          {setores.length === 0 ? (
            <p className="text-sm text-slate-600">Nenhum setor cadastrado na empresa.</p>
          ) : (
            <div className="space-y-3 text-sm">
              {setores.map((s) => (
                <div key={s.id} className="rounded border border-slate-200 p-3">
                  <p className="font-semibold">{s.nome}</p>
                  {s.descricao && <p className="text-xs text-slate-600">{s.descricao}</p>}
                  <p className="text-xs mt-1">
                    Colaboradores ativos: <strong>{s._count.colaboradores}</strong>
                  </p>
                  <p className="text-xs">
                    Funções:{" "}
                    {s.funcoes.length ? s.funcoes.map((f) => f.nome).join("; ") : "—"}
                  </p>
                  <p className="text-xs">
                    GHE:{" "}
                    {s.ghes.length
                      ? s.ghes
                          .map((g) => (g.descricao ? `${g.nome} (${g.descricao})` : g.nome))
                          .join("; ")
                      : "—"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="px-6 py-5 border-b border-slate-300">
          <h2 className="font-bold text-sm uppercase tracking-wide border-b border-slate-300 pb-1 mb-3">
            3. Caracterização dos processos e ambientes
          </h2>
          <pre className="text-xs sm:text-sm whitespace-pre-wrap font-sans leading-relaxed">
            {pgr.caracterizacaoProcessos ||
              "Caracterização não preenchida. Use «Atualizar da empresa» na ficha do PGR."}
          </pre>
        </section>

        <section className="px-6 py-5 border-b border-slate-300">
          <h2 className="font-bold text-sm uppercase tracking-wide border-b border-slate-300 pb-1 mb-3">
            4. Metodologia de avaliação (NR-1)
          </h2>
          <pre className="text-xs sm:text-sm whitespace-pre-wrap font-sans leading-relaxed">
            {pgr.metodologiaAvaliacao || "—"}
          </pre>
        </section>

        <section className="px-6 py-5 border-b border-slate-300 break-page">
          <h2 className="font-bold text-sm uppercase tracking-wide border-b border-slate-300 pb-1 mb-3">
            5. Inventário de riscos ocupacionais (NR-1 item 1.5.7.3)
          </h2>
          {pgr.inventarioItens.length === 0 ? (
            <p className="text-sm text-slate-600">Inventário ainda não preenchido.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-slate-400 text-left">
                    <th className="p-1.5">Risco</th>
                    <th className="p-1.5">Tipo</th>
                    <th className="p-1.5">Setor / GHE / Função</th>
                    <th className="p-1.5">Fonte</th>
                    <th className="p-1.5">Expostos</th>
                    <th className="p-1.5">P×S</th>
                    <th className="p-1.5">Nível</th>
                    <th className="p-1.5">Medidas existentes</th>
                  </tr>
                </thead>
                <tbody>
                  {pgr.inventarioItens.map((item) => (
                    <tr key={item.id} className="border-b border-slate-200 align-top">
                      <td className="p-1.5 font-medium">{item.risco.nome}</td>
                      <td className="p-1.5">{TIPO_RISCO_LABELS[item.risco.tipo]}</td>
                      <td className="p-1.5">
                        {[item.setorNome, item.gheNome, item.funcaoNome].filter(Boolean).join(" / ") ||
                          "—"}
                      </td>
                      <td className="p-1.5">{item.fonteGeradora || "—"}</td>
                      <td className="p-1.5">{item.numeroExpostos ?? "—"}</td>
                      <td className="p-1.5">
                        {item.probabilidade != null && item.severidade != null
                          ? `${item.probabilidade}×${item.severidade}`
                          : "—"}
                      </td>
                      <td className="p-1.5 font-semibold">
                        {item.nivelRisco ? NIVEL_RISCO_LABELS[item.nivelRisco] : "—"}
                      </td>
                      <td className="p-1.5">{item.medidasExistentes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="px-6 py-5 border-b border-slate-300">
          <h2 className="font-bold text-sm uppercase tracking-wide border-b border-slate-300 pb-1 mb-3">
            6. Plano de ação
          </h2>
          {pgr.planoAcaoItens.length === 0 ? (
            <p className="text-sm text-slate-600">Nenhuma ação cadastrada.</p>
          ) : (
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              {pgr.planoAcaoItens.map((a) => (
                <li key={a.id}>
                  <strong>{a.descricaoAcao}</strong>
                  {a.riscoRelacionado && (
                    <span className="text-slate-600"> — risco: {a.riscoRelacionado}</span>
                  )}
                  <span className="block text-xs text-slate-500">
                    Prioridade: {a.prioridade || "—"} · Status: {a.status}
                    {a.responsavel ? ` · Resp.: ${a.responsavel}` : ""}
                    {a.prazo ? ` · Prazo: ${formatDate(a.prazo)}` : ""}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="px-6 py-5">
          <h2 className="font-bold text-sm uppercase tracking-wide border-b border-slate-300 pb-1 mb-3">
            7. Responsável pela elaboração
          </h2>
          <div className="grid sm:grid-cols-2 gap-6 text-sm mt-4">
            <div>
              <p><strong>Nome:</strong> {pgr.elaboradorNome || "_______________________________"}</p>
              <p><strong>Registro:</strong> {pgr.elaboradorRegistro || "_______________________________"}</p>
              <div className="mt-10 border-t border-slate-800 w-48 pt-1 text-xs text-slate-500">
                Assinatura
              </div>
            </div>
            <div>
              <p><strong>Data:</strong> {formatDate(pgr.dataElaboracao)}</p>
              <p className="text-xs text-slate-500 mt-2">
                Documento gerado pelo SGS com dados cadastrais da empresa, setores, GHE e inventário.
              </p>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-300 px-6 py-3 text-[10px] text-slate-500 text-center">
          SGS — Sistema de Gestão em Segurança do Trabalho · PGR conforme NR-1/MTE · Este documento
          deve ser revisado conforme a norma e validado por profissional legalmente habilitado.
        </footer>
      </div>
    </div>
  );
}
