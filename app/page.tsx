import Link from "next/link";
import { Shield, FileText, Stethoscope, Users, Building2, ClipboardCheck } from "lucide-react";

const recursos = [
  {
    icon: FileText,
    title: "PGR Completo",
    desc: "Wizard de inventário de riscos, classificação, GHE e Plano de Ação. Gera o documento conforme NR-1 e NR-9.",
  },
  {
    icon: Stethoscope,
    title: "PCMSO Integrado",
    desc: "Vinculado automaticamente aos riscos do PGR. Define exames por setor e função e gera o documento NR-7.",
  },
  {
    icon: ClipboardCheck,
    title: "Fluxo de ASO",
    desc: "Solicitação de exames, formulário ASO + checklist psicossocial, edição pela clínica e upload do atestado.",
  },
  {
    icon: Building2,
    title: "Multi-empresa",
    desc: "Cadastro de empresas, clínicas, médicos e colaboradores com controle de acesso por perfil.",
  },
  {
    icon: Users,
    title: "Colaboradores",
    desc: "Cadastro vinculado a setor, função e riscos. Histórico de exames e ASOs em um só lugar.",
  },
  {
    icon: Shield,
    title: "Conformidade",
    desc: "Documentos alinhados às Normas Regulamentadoras do MTE. Pronto para impressão e envio.",
  },
];

const normas = [
  { nr: "NR-1", nome: "Gerenciamento de Riscos Ocupacionais (PGR)" },
  { nr: "NR-7", nome: "PCMSO e Atestado de Saúde Ocupacional" },
  { nr: "NR-9", nome: "Agentes Físicos, Químicos e Biológicos" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sgs-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-sgs-700 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-sgs-900">SGS</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-sgs-800">
            <a href="#recursos" className="hover:text-sgs-600 transition">
              Recursos
            </a>
            <a href="#conformidade" className="hover:text-sgs-600 transition">
              Conformidade
            </a>
            <Link href="/login" className="hover:text-sgs-600 transition">
              Entrar
            </Link>
          </nav>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-sgs-700 px-4 py-2 text-sm font-medium text-white shadow hover:bg-sgs-800 transition"
          >
            Acessar sistema
          </Link>
        </div>
      </header>

      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-sgs-100 px-4 py-1.5 text-sm font-medium text-sgs-800 mb-6">
          <Shield className="w-4 h-4" />
          Gestão profissional de SST
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-sgs-950 max-w-4xl mx-auto leading-tight">
          Sistema de Gestão em{" "}
          <span className="text-sgs-600">Segurança do Trabalho</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-sgs-700 max-w-2xl mx-auto">
          PGR, PCMSO, Medicina Ocupacional e documentação completa conforme NR-1, NR-7 e NR-9.
          Do inventário de riscos até o ASO — tudo integrado e profissional.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-sgs-700 px-8 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-sgs-800 transition"
          >
            Começar agora
          </Link>
          <a
            href="#recursos"
            className="inline-flex items-center justify-center rounded-lg border border-sgs-300 bg-white px-8 py-3.5 text-base font-semibold text-sgs-800 hover:bg-sgs-50 transition"
          >
            Conhecer recursos
          </a>
        </div>
      </section>

      <section id="recursos" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-sgs-900">Tudo que você precisa em um só lugar</h2>
          <p className="mt-3 text-sgs-600 max-w-xl mx-auto">
            Fluxo completo desde o levantamento de riscos até a entrega do ASO assinado.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recursos.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="w-11 h-11 rounded-lg bg-sgs-100 flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5 text-sgs-700" />
              </div>
              <h3 className="font-semibold text-lg text-sgs-900">{item.title}</h3>
              <p className="mt-2 text-sm text-sgs-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="conformidade" className="bg-sgs-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Conformidade com as NRs</h2>
          <p className="mt-3 text-sgs-200 max-w-2xl mx-auto">
            O sistema foi desenhado para apoiar a elaboração de documentos alinhados às normas
            vigentes do Ministério do Trabalho e Emprego.
          </p>
          <div className="mt-10 grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {normas.map((item) => (
              <div key={item.nr} className="rounded-lg bg-sgs-800/60 border border-sgs-700 p-5">
                <div className="text-2xl font-bold text-sgs-300">{item.nr}</div>
                <div className="mt-1 text-sm text-sgs-100">{item.nome}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-sgs-600">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="font-semibold text-sgs-800">SGS</span>
            <span>— Sistema de Gestão em Segurança do Trabalho</span>
          </div>
          <p>Documento gerado deve ser revisado por profissional legalmente habilitado.</p>
        </div>
      </footer>
    </div>
  );
}
