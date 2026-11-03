import Link from "next/link";
import { notFound } from "next/navigation";
import { getPET } from "@/app/actions/operacional";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrintButton } from "@/components/print-button";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pet = await getPET(id);
  if (!pet) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <p className="text-sm text-sgs-800 font-medium">PET · NR-33</p>
          <h1 className="text-2xl font-bold">{pet.identificacaoEspaco}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {pet.empresa.nomeFantasia || pet.empresa.razaoSocial}
            {pet.numero ? ` · Nº ${pet.numero}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <PrintButton label="Imprimir / PDF" />
          <Link href="/pet">
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b bg-amber-50/80">
          <CardTitle className="text-base">Permissão de Entrada e Trabalho — Espaço Confinado</CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Local</p>
            <p className="font-medium">{pet.local}</p>
          </div>
          <div>
            <p className="text-slate-500">Status</p>
            <p className="font-medium">{pet.status}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-slate-500">Atividade</p>
            <p className="font-medium whitespace-pre-wrap">{pet.atividade}</p>
          </div>
          <div>
            <p className="text-slate-500">Entrada</p>
            <p className="font-medium">{formatDate(pet.dataEntrada)}</p>
          </div>
          <div>
            <p className="text-slate-500">Saída prevista</p>
            <p className="font-medium">{pet.dataSaidaPrevista ? formatDate(pet.dataSaidaPrevista) : "—"}</p>
          </div>
          <div>
            <p className="text-slate-500">Atmosfera</p>
            <p className="font-medium">{pet.atmosfera || "—"}</p>
          </div>
          <div>
            <p className="text-slate-500">O₂ (%)</p>
            <p className="font-medium">{pet.oxigenioPercentual || "—"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-slate-500">Gases medidos</p>
            <p className="font-medium">{pet.gasesMedidos || "—"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-slate-500">Ventilação / EPI-EPC</p>
            <p className="font-medium">
              {pet.ventilacao || "—"} / {pet.epiEpc || "—"}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-slate-500">Riscos adicionais</p>
            <p className="font-medium whitespace-pre-wrap">{pet.riscosAdicionais || "—"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-slate-500">Procedimentos de entrada</p>
            <p className="font-medium whitespace-pre-wrap">{pet.procedimentosEntrada || "—"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-slate-500">Emergência</p>
            <p className="font-medium whitespace-pre-wrap">{pet.procedimentosEmergencia || "—"}</p>
          </div>
          <div>
            <p className="text-slate-500">Supervisor de entrada</p>
            <p className="font-medium">{pet.supervisorNome || "—"}</p>
          </div>
          <div>
            <p className="text-slate-500">Vigia</p>
            <p className="font-medium">{pet.vigiaNome || "—"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-slate-500">Trabalhadores autorizados</p>
            <p className="font-medium">{pet.trabalhadoresNomes || "—"}</p>
          </div>

          <div className="sm:col-span-2 grid sm:grid-cols-3 gap-6 pt-8 text-center text-sm">
            <div>
              <div className="border-b border-slate-400 mb-1 h-10" />
              <p className="text-xs text-slate-500">Supervisor</p>
            </div>
            <div>
              <div className="border-b border-slate-400 mb-1 h-10" />
              <p className="text-xs text-slate-500">Vigia</p>
            </div>
            <div>
              <div className="border-b border-slate-400 mb-1 h-10" />
              <p className="text-xs text-slate-500">Trabalhador</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
