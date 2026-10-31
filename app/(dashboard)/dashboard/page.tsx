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
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

  try {
    const [e, c, p, a, cl, pc] = await Promise.all([
      prisma.empresa.count({ where: { ativo: true } }),
      prisma.colaborador.count({ where: { ativo: true } }),
      prisma.pGR.count({ where: { status: { not: "VENCIDO" } } }),
      prisma.solicitacaoExame.count({
        where: { status: { in: ["PENDENTE", "ENVIADA_CLINICA", "EM_ATENDIMENTO"] } },
      }),
      prisma.clinica.count({ where: { ativo: true } }),
      prisma.pCMSO.count({ where: { status: { not: "VENCIDO" } } }),
    ]);
    empresas = e;
    colaboradores = c;
    pgrs = p;
    asosPendentes = a;
    clinicas = cl;
    pcmso = pc;
  } catch {
    dbOk = false;
  }

  const stats = [
    { label: "Empresas ativas", value: dbOk ? String(empresas) : "—", icon: Building2, color: "bg-blue-100 text-blue-700", href: "/empresas" },
    { label: "Colaboradores", value: dbOk ? String(colaboradores) : "—", icon: Users, color: "bg-emerald-100 text-emerald-700", href: "/colaboradores" },
    { label: "PGRs ativos", value: dbOk ? String(pgrs) : "—", icon: FileText, color: "bg-violet-100 text-violet-700", href: "/pgr" },
    { label: "Exames pendentes", value: dbOk ? String(asosPendentes) : "—", icon: ClipboardList, color: "bg-amber-100 text-amber-700", href: "/exames" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Olá{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-slate-500 mt-1">Visão geral da gestão de Segurança do Trabalho</p>
      </div>

      {!dbOk && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Banco de dados:</strong> não foi possível conectar. Configure o{" "}
          <code className="bg-amber-100 px-1 rounded">DATABASE_URL</code> com Postgres (Neon) nas variáveis da Vercel e faça Redeploy.
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

      <Card className="border-sgs-200 bg-sgs-50/50">
        <CardHeader>
          <CardTitle className="text-lg text-sgs-900">Fluxo recomendado</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm text-sgs-800">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sgs-700 text-white text-xs font-bold">1</span>
              <span>Cadastre a <strong>empresa</strong> (CNPJ, grau de risco NR-4, CNAE).</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sgs-700 text-white text-xs font-bold">2</span>
              <span>Crie <strong>setores</strong>, <strong>funções</strong> e <strong>colaboradores</strong>.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sgs-700 text-white text-xs font-bold">3</span>
              <span>Elabore o <strong>PGR</strong> (inventário + plano de ação).</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sgs-700 text-white text-xs font-bold">4</span>
              <span>Gere o <strong>PCMSO</strong> e defina os exames.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sgs-700 text-white text-xs font-bold">5</span>
              <span>Cadastre a <strong>clínica</strong>, solicite exames e emita o <strong>ASO</strong>.</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Em breve no SGS</CardTitle>
          <CardDescription>Próximos módulos planejados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            {[
              "Treinamentos e DDS",
              "Carteirinha do colaborador",
              "Controle de EPI",
              "Ordem de serviço",
            ].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-3 text-slate-600"
              >
                {item}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
