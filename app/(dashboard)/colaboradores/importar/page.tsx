import Link from "next/link";
import { listEmpresas } from "@/app/actions/empresas";
import { ImportColaboradoresForm } from "@/components/forms/import-colaboradores-form";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ImportarColaboradoresPage() {
  const empresas = await listEmpresas();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Importar colaboradores</h1>
          <p className="text-slate-500 mt-1">
            Três formas: <strong>colar texto</strong> do Excel, <strong>arquivo CSV</strong> ou{" "}
            <strong>foto / scanner</strong> (OCR). O sistema tenta colocar cada dado no campo certo —
            revise a pré-visualização antes de importar.
          </p>
        </div>
        <Link href="/colaboradores">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>

      {empresas.length === 0 ? (
        <p className="text-sm text-slate-600">
          Cadastre uma empresa antes de importar.{" "}
          <Link href="/empresas/nova" className="text-sgs-700 underline">
            Nova empresa
          </Link>
        </p>
      ) : (
        <ImportColaboradoresForm empresas={empresas} />
      )}
    </div>
  );
}
