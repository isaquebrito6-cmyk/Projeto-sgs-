import Link from "next/link";
import { notFound } from "next/navigation";
import { getTreinamento } from "@/app/actions/treinamentos";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/print-button";
import { formatDate, formatCPF } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ListaPresencaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTreinamento(id);
  if (!t) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-xl font-bold">Lista de presença</h1>
          <p className="text-sm text-slate-500">{t.titulo}</p>
        </div>
        <div className="flex gap-2">
          <PrintButton />
          <Link href={`/treinamentos/${id}`}>
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 print:border-0">
        <div className="mb-6 border-b pb-4">
          <h2 className="font-bold text-lg">{t.titulo}</h2>
          <p className="text-sm text-slate-600">{t.tipo}</p>
          <div className="mt-2 grid sm:grid-cols-2 gap-1 text-sm">
            <p>
              <span className="text-slate-500">Empresa:</span>{" "}
              {t.empresa.nomeFantasia || t.empresa.razaoSocial}
            </p>
            <p>
              <span className="text-slate-500">Data:</span>{" "}
              {t.dataRealizacao ? formatDate(t.dataRealizacao) : "____/____/________"}
            </p>
            <p>
              <span className="text-slate-500">Carga horária:</span>{" "}
              {t.cargaHoraria != null ? `${t.cargaHoraria}h` : "____"}
            </p>
            <p>
              <span className="text-slate-500">Local:</span> {t.local || "________________"}
            </p>
            <p className="sm:col-span-2">
              <span className="text-slate-500">Instrutor:</span> {t.instrutor || "________________"}
            </p>
          </div>
        </div>

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-800 text-left">
              <th className="py-2 pr-2 w-8">#</th>
              <th className="py-2 pr-2">Nome</th>
              <th className="py-2 pr-2">CPF</th>
              <th className="py-2 pr-2">Função</th>
              <th className="py-2 w-32">Assinatura</th>
            </tr>
          </thead>
          <tbody>
            {(t.participantes.length > 0
              ? t.participantes
              : Array.from({ length: 12 }).map((_, i) => ({ id: `empty-${i}`, colaborador: null }))
            ).map((p: any, idx: number) => (
              <tr key={p.id} className="border-b border-slate-200">
                <td className="py-3 pr-2 text-slate-500">{idx + 1}</td>
                <td className="py-3 pr-2">{p.colaborador?.nome || ""}</td>
                <td className="py-3 pr-2">
                  {p.colaborador?.cpf ? formatCPF(p.colaborador.cpf) : ""}
                </td>
                <td className="py-3 pr-2">{p.colaborador?.funcao?.nome || ""}</td>
                <td className="py-3">
                  <div className="border-b border-slate-400 h-6" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-10 text-center text-sm">
          <div className="inline-block w-64">
            <div className="border-b border-slate-400 h-8 mb-1" />
            <p className="text-xs text-slate-500">Instrutor / Responsável técnico</p>
          </div>
        </div>
      </div>
    </div>
  );
}
