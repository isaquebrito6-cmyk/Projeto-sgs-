import Link from "next/link";
import { notFound } from "next/navigation";
import { getColaborador } from "@/app/actions/colaboradores";
import { Button } from "@/components/ui/button";
import { formatCPF, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CarteirinhaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await getColaborador(id);
  if (!c) notFound();

  const empresa = c.empresa.nomeFantasia || c.empresa.razaoSocial;

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div className="flex justify-between gap-2 print:hidden">
        <Link href={`/colaboradores/${id}`}>
          <Button variant="outline">Voltar</Button>
        </Link>
        <Button className="bg-sgs-700 hover:bg-sgs-800" onClick={undefined} asChild>
          <button type="button" onClick={() => typeof window !== "undefined" && window.print()}>
            Imprimir carteirinha
          </button>
        </Button>
      </div>

      {/* Fallback client print */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.querySelector('[data-print]')?.addEventListener('click',()=>window.print())`,
        }}
      />

      <div className="print:hidden">
        <button
          data-print
          type="button"
          className="w-full rounded-md bg-sgs-700 hover:bg-sgs-800 text-white text-sm py-2"
          // @ts-expect-error server component button handled via script
        >
          Imprimir / salvar PDF
        </button>
      </div>

      <div className="rounded-xl border-2 border-sgs-700 bg-white overflow-hidden shadow-sm">
        <div className="bg-sgs-800 text-white px-4 py-2 text-center">
          <p className="text-xs uppercase tracking-wide opacity-90">Identificação do trabalhador</p>
          <p className="font-semibold text-sm">{empresa}</p>
        </div>
        <div className="p-4 flex gap-4">
          <div className="w-24 h-32 rounded border bg-slate-100 overflow-hidden shrink-0">
            {c.fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.fotoUrl} alt={c.nome} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 p-1 text-center">
                Sem foto
              </div>
            )}
          </div>
          <div className="text-sm space-y-1 min-w-0">
            <p className="font-bold text-base leading-tight">{c.nome}</p>
            <p>
              <span className="text-slate-500">CPF:</span> {formatCPF(c.cpf)}
            </p>
            {c.funcao && (
              <p>
                <span className="text-slate-500">Função:</span> {c.funcao.nome}
              </p>
            )}
            {c.setor && (
              <p>
                <span className="text-slate-500">Setor:</span> {c.setor.nome}
              </p>
            )}
            {c.dataAdmissao && (
              <p>
                <span className="text-slate-500">Admissão:</span> {formatDate(c.dataAdmissao)}
              </p>
            )}
          </div>
        </div>
        <div className="border-t px-4 py-2 text-[10px] text-slate-500 text-center">
          Documento de uso interno · SST / SGS · {new Date().toLocaleDateString("pt-BR")}
        </div>
      </div>

      <p className="text-xs text-slate-500 print:hidden text-center">
        Cadastre a foto em Colaboradores → Editar (câmera, upload ou colar).
      </p>
    </div>
  );
}
