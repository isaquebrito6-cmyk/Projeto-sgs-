import Link from "next/link";
import { Plus, Users, Upload, Camera, ClipboardPaste, FileSpreadsheet } from "lucide-react";
import { listColaboradores } from "@/app/actions/colaboradores";
import { listEmpresas } from "@/app/actions/empresas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCPF, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ColaboradoresPage({
  searchParams,
}: {
  searchParams: Promise<{ empresaId?: string }>;
}) {
  const params = await searchParams;
  const [colaboradores, empresas] = await Promise.all([
    listColaboradores(params.empresaId),
    listEmpresas(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Colaboradores</h1>
          <p className="text-slate-500 mt-1">
            Cadastro individual ou importação em massa (colar, CSV, foto/scanner)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/colaboradores/importar">
            <Button variant="outline">
              <Upload className="w-4 h-4" />
              Importar lista
            </Button>
          </Link>
          <Link href="/colaboradores/novo">
            <Button className="bg-sgs-700 hover:bg-sgs-800">
              <Plus className="w-4 h-4" />
              Novo colaborador
            </Button>
          </Link>
        </div>
      </div>

      {/* Atalhos de inclusão */}
      <div className="grid sm:grid-cols-3 gap-3">
        <Link href="/colaboradores/importar" className="block">
          <Card className="h-full hover:shadow-md transition border-sgs-200">
            <CardContent className="p-4 flex gap-3 items-start">
              <div className="w-10 h-10 rounded-lg bg-sgs-100 flex items-center justify-center shrink-0">
                <ClipboardPaste className="w-5 h-5 text-sgs-700" />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-900">Colar lista</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Copie do Excel e cole. O sistema separa Nome, CPF, setor e função.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/colaboradores/importar" className="block">
          <Card className="h-full hover:shadow-md transition border-sgs-200">
            <CardContent className="p-4 flex gap-3 items-start">
              <div className="w-10 h-10 rounded-lg bg-sgs-100 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5 text-sgs-700" />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-900">Upload CSV</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Envie arquivo .csv ou .txt com cabeçalhos e importe de uma vez.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/colaboradores/importar" className="block">
          <Card className="h-full hover:shadow-md transition border-sgs-200">
            <CardContent className="p-4 flex gap-3 items-start">
              <div className="w-10 h-10 rounded-lg bg-sgs-100 flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5 text-sgs-700" />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-900">Foto / scanner</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tire foto ou cole imagem da lista — OCR preenche os campos para revisão.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {empresas.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/colaboradores"
            className={`rounded-full px-3 py-1 text-sm font-medium transition ${
              !params.empresaId
                ? "bg-sgs-700 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Todas
          </Link>
          {empresas.map((emp) => (
            <Link
              key={emp.id}
              href={`/colaboradores?empresaId=${emp.id}`}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                params.empresaId === emp.id
                  ? "bg-sgs-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {emp.nomeFantasia || emp.razaoSocial}
            </Link>
          ))}
        </div>
      )}

      {colaboradores.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-sgs-100 flex items-center justify-center mb-4">
              <Users className="w-7 h-7 text-sgs-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Nenhum colaborador cadastrado</h3>
            <p className="text-slate-500 mt-1 max-w-sm">
              Use importação (colar, CSV ou foto) ou cadastre um a um.
            </p>
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              <Link href="/colaboradores/importar">
                <Button variant="outline">
                  <Upload className="w-4 h-4" />
                  Importar lista
                </Button>
              </Link>
              <Link href="/colaboradores/novo">
                <Button className="bg-sgs-700 hover:bg-sgs-800">
                  <Plus className="w-4 h-4" />
                  Cadastrar colaborador
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {colaboradores.map((colab) => (
            <Link key={colab.id} href={`/colaboradores/${colab.id}`}>
              <Card className="hover:shadow-md transition cursor-pointer">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-sgs-100 flex items-center justify-center shrink-0 text-sgs-700 font-semibold text-sm">
                        {colab.nome
                          .split(" ")
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{colab.nome}</h3>
                        <p className="text-sm text-slate-500">
                          CPF: {formatCPF(colab.cpf)}
                          {colab.funcao && <> · {colab.funcao.nome}</>}
                          {colab.setor && <> · {colab.setor.nome}</>}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-slate-500 sm:text-right">
                      <p>{colab.empresa.nomeFantasia || colab.empresa.razaoSocial}</p>
                      {colab.dataAdmissao && (
                        <p className="text-xs">Admissão: {formatDate(colab.dataAdmissao)}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
