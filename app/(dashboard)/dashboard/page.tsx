import {
  Building2,
  Users,
  FileText,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "Empresas ativas", value: "—", icon: Building2, color: "bg-blue-100 text-blue-700" },
  { label: "Colaboradores", value: "—", icon: Users, color: "bg-emerald-100 text-emerald-700" },
  { label: "PGRs ativos", value: "—", icon: FileText, color: "bg-violet-100 text-violet-700" },
  { label: "ASOs pendentes", value: "—", icon: ClipboardList, color: "bg-amber-100 text-amber-700" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Visão geral da gestão de Segurança do Trabalho</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
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
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Alertas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Alertas e pendências
            </CardTitle>
            <CardDescription>Itens que precisam de atenção</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 text-sm text-slate-500">
                <Clock className="w-4 h-4 shrink-0" />
                Nenhum alerta no momento. Comece cadastrando empresas e colaboradores.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações rápidas */}
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
                { href: "/empresas", label: "Nova empresa" },
                { href: "/colaboradores", label: "Novo colaborador" },
                { href: "/pgr", label: "Criar PGR" },
                { href: "/exames", label: "Solicitar exame" },
              ].map((action) => (
                <a
                  key={action.href}
                  href={action.href}
                  className="flex items-center justify-center rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-sgs-50 hover:border-sgs-300 hover:text-sgs-800 transition"
                >
                  {action.label}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próximos passos */}
      <Card className="border-sgs-200 bg-sgs-50/50">
        <CardHeader>
          <CardTitle className="text-lg text-sgs-900">Próximos passos para começar</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm text-sgs-800">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sgs-700 text-white text-xs font-bold">1</span>
              <span>Cadastre a <strong>empresa</strong> e seus dados (CNPJ, grau de risco, CNAE).</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sgs-700 text-white text-xs font-bold">2</span>
              <span>Crie os <strong>setores</strong>, <strong>funções</strong> e cadastre os <strong>colaboradores</strong>.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sgs-700 text-white text-xs font-bold">3</span>
              <span>Elabore o <strong>PGR</strong> (inventário de riscos + plano de ação).</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sgs-700 text-white text-xs font-bold">4</span>
              <span>Gere o <strong>PCMSO</strong> vinculado ao PGR e defina os exames.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sgs-700 text-white text-xs font-bold">5</span>
              <span>Cadastre a <strong>clínica</strong> e comece a solicitar exames e receber ASOs.</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
