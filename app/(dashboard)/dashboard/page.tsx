import Link from "next/link";
import {
  Building2,
  Users,
  FileText,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Hospital,
  Stethoscope,
  Cake,
  Award,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma, testDatabase } from "@/lib/prisma";
import { requireUser, empresaIdFilter, isAdmin } from "@/lib/tenant";
import {
  ANTECEDENCIA_DIAS,
  calcularAvisosAniversario,
  labelAntecedencia,
} from "@/lib/aniversarios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();

  let empresas = 0;
  let colaboradores = 0;
  let pgrs = 0;
  let asosPendentes = 0;
  let clinicas = 0;
  let pcmso = 0;
  let dbOk = true;
  let dbMessage = "";
  let avisos: ReturnType<typeof calcularAvisosAniversario> = [];

  const dbTest = await testDatabase();
  dbOk = dbTest.ok;
  dbMessage = dbTest.message;

  if (dbOk) {
    try {
      const user = await requireUser();
      const scopedEmpresa = empresaIdFilter(user);

      const empresaWhere = scopedEmpresa
        ? { ativo: true as const, id: scopedEmpresa }
        : { ativo: true as const };
      const colabWhere = scopedEmpresa
        ? { ativo: true as const, empresaId: scopedEmpresa }
        : { ativo: true as const };

      const [e, c, p, a, cl, pc, listaColab] = await Promise.all([
        prisma.empresa.count({ where: empresaWhere }),
        prisma.colaborador.count({ where: colabWhere }),
        prisma.pGR.count({
          where: {
            status: { not: "VENCIDO" },
            ...(scopedEmpresa ? { empresaId: scopedEmpresa } : {}),
          },
        }),
        prisma.solicitacaoExame.count({
          where: {
            status: { in: ["PENDENTE", "ENVIADA_CLINICA", "EM_ATENDIMENTO"] },
            ...(scopedEmpresa ? { empresaId: scopedEmpresa } : {}),
          },
        }),
        isAdmin(user)
          ? prisma.clinica.count({ where: { ativo: true } })
          : prisma.clinica.count({ where: { ativo: true } }),
        prisma.pCMSO.count({
          where: {
            status: { not: "VENCIDO" },
            ...(scopedEmpresa ? { empresaId: scopedEmpresa } : {}),
          },
        }),
        prisma.colaborador.findMany({
          where: {
            ativo: true,
            ...(scopedEmpresa ? { empresaId: scopedEmpresa } : {}),
            OR: [{ dataNascimento: { not: null } }, { dataAdmissao: { not: null } }],
          },
          select: {
            id: true,
            nome: true,
            dataNascimento: true,
            dataAdmissao: true,
            empresa: { select: { nomeFantasia: true, razaoSocial: true } },
          },
          take: 2000,
        }),
      ]);

      empresas = e;
      colaboradores = c;
      pgrs = p;
      asosPendentes = a;
      clinicas = cl;
      pcmso = pc;
      avisos = calcularAvisosAniversario(listaColab, ANTECEDENCIA_DIAS);
    } catch {
      dbOk = false;
      dbMessage = "Falha ao ler tabelas. Rode Redeploy para criar o schema (prisma db push).";
    }
  }

  const stats = [
    {
      label: "Empresas ativas",
      value: dbOk ? String(empresas) : "—",
      icon: Building2,
      color: "bg-blue-100 text-blue-700",
      href: "/empresas",
    },
    {
      label: "Colaboradores",
      value: dbOk ? String(colaboradores) : "—",
      icon: Users,
      color: "bg-emerald-100 text-emerald-700",
      href: "/colaboradores",
    },
    {
      label: "PGRs ativos",
      value: dbOk ? String(pgrs) : "—",
      icon: FileText,
      color: "bg-violet-100 text-violet-700",
      href: "/pgr",
    },
    {
      label: "Exames pendentes",
      value: dbOk ? String(asosPendentes) : "—",
      icon: ClipboardList,
      color: "bg-amber-100 text-amber-700",
      href: "/exames",
    },
  ];

  const hoje = avisos.filter((a) => a.dias === 0);
  const proximos = avisos.filter((a) => a.dias > 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Olá{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-slate-500 mt-1">Visão geral da gestão de Segurança do Trabalho</p>
      </div>

      {!dbOk && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 space-y-1">
          <p>
            <strong>Banco de dados:</strong> não foi possível conectar.
          </p>
          <p className="text-xs text-amber-800/80 break-all">{dbMessage}</p>
        </div>
      )}

      {/* Aniversários em destaque */}
      {dbOk && avisos.length > 0 && (
        <Card
          className={cn(
            "overflow-hidden border-2",
            hoje.length > 0
              ? "border-pink-400 bg-gradient-to-br from-pink-50 via-amber-50 to-white shadow-md"
              : "border-violet-200 bg-gradient-to-br from-violet-50 to-white"
          )}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-500 text-white shadow">
                <Cake className="w-5 h-5" />
              </span>
              Aniversários
              {hoje.length > 0 && (
                <span className="ml-1 rounded-full bg-pink-500 px-2.5 py-0.5 text-xs font-bold text-white animate-pulse">
                  {hoje.length} hoje!
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Idade e tempo de empresa — avisos com até {ANTECEDENCIA_DIAS} dias de antecedência
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {avisos.map((a) => {
              const isHoje = a.dias === 0;
              const isIdade = a.tipo === "idade";
              return (
                <Link
                  key={`${a.tipo}-${a.colaboradorId}-${a.dataLabel}`}
                  href={`/colaboradores/${a.colaboradorId}`}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3 py-3 transition hover:shadow-sm",
                    isHoje
                      ? "border-pink-300 bg-white ring-2 ring-pink-200"
                      : a.dias <= 2
                        ? "border-amber-200 bg-amber-50/80"
                        : "border-slate-200 bg-white"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                      isIdade
                        ? isHoje
                          ? "bg-pink-500 text-white"
                          : "bg-pink-100 text-pink-700"
                        : isHoje
                          ? "bg-amber-500 text-white"
                          : "bg-amber-100 text-amber-800"
                    )}
                  >
                    {isIdade ? <Cake className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 truncate">{a.nome}</p>
                    <p className="text-xs text-slate-500 truncate">{a.empresaNome}</p>
                    <p className="text-sm mt-0.5">
                      {isIdade ? (
                        <>
                          Completa <strong>{a.marca} anos</strong>
                        </>
                      ) : (
                        <>
                          <strong>{a.marca} ano(s)</strong> de empresa
                        </>
                      )}
                      <span className="text-slate-400"> · {a.dataLabel}</span>
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={cn(
                        "inline-block rounded-full px-2.5 py-1 text-xs font-bold",
                        isHoje
                          ? "bg-pink-500 text-white"
                          : a.dias === 1
                            ? "bg-amber-400 text-amber-950"
                            : "bg-slate-100 text-slate-700"
                      )}
                    >
                      {labelAntecedencia(a.dias)}
                    </span>
                  </div>
                </Link>
              );
            })}
            {proximos.length === 0 && hoje.length > 0 && (
              <p className="text-xs text-slate-500">Nenhum outro aniversário nos próximos {ANTECEDENCIA_DIAS} dias.</p>
            )}
          </CardContent>
        </Card>
      )}

      {dbOk && avisos.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Nenhum aniversário de idade ou de empresa nos próximos {ANTECEDENCIA_DIAS} dias. Cadastre{" "}
          <strong>data de nascimento</strong> e <strong>admissão</strong> nos colaboradores para
          ativar os avisos.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:shadow-md transition cursor-pointer h-full">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Situação atual
            </CardTitle>
            <CardDescription>Resumo operacional</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <span className="flex items-center gap-2 text-slate-600">
                <Hospital className="w-4 h-4" /> Clínicas cadastradas
              </span>
              <strong>{dbOk ? clinicas : "—"}</strong>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <span className="flex items-center gap-2 text-slate-600">
                <Stethoscope className="w-4 h-4" /> PCMSOs ativos
              </span>
              <strong>{dbOk ? pcmso : "—"}</strong>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <span className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4" /> Exames aguardando ASO
              </span>
              <strong className={asosPendentes > 0 ? "text-amber-700" : ""}>
                {dbOk ? asosPendentes : "—"}
              </strong>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="w-5 h-5 text-sgs-600" />
              Ações rápidas
            </CardTitle>
            <CardDescription>Atalhos para as principais tarefas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: "/empresas/nova", label: "Nova empresa" },
                { href: "/colaboradores/novo", label: "Novo colaborador" },
                { href: "/pgr/novo", label: "Criar PGR" },
                { href: "/exames/nova", label: "Solicitar exame" },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center justify-center rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-sgs-50 hover:border-sgs-300 hover:text-sgs-800 transition"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
