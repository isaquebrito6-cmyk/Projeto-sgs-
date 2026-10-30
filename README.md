# SGS — Sistema de Gestão em Segurança do Trabalho

Sistema profissional de gestão de SST focado em **Medicina Ocupacional**, documentação e conformidade com as Normas Regulamentadoras do Ministério do Trabalho e Emprego (MTE).

## Funcionalidades principais

- **PGR (Programa de Gerenciamento de Riscos)** conforme NR-1 e NR-9
  - Wizard de inventário de riscos ocupacionais
  - Classificação de riscos (probabilidade × severidade)
  - Grupos Homogêneos de Exposição (GHE)
  - Plano de Ação
  - Geração automática do documento completo em PDF

- **PCMSO (Programa de Controle Médico de Saúde Ocupacional)** conforme NR-7
  - Vinculado automaticamente aos riscos do PGR
  - Definição de exames por setor, função e risco
  - Geração do documento PCMSO

- **Fluxo completo de Medicina Ocupacional**
  - Cadastro de empresas, clínicas, médicos e colaboradores
  - Solicitação de exames com formulário ASO + checklist psicossocial pré-preenchidos
  - Clínica edita, assina e faz upload do ASO
  - Empresa visualiza, imprime e baixa os ASOs

- Interface **100% responsiva** (mobile + desktop)
- Controle de acesso por perfil (Empresa · Clínica · Médico · Administrador)
- Dashboard com alertas de vencimentos e pendências

## Stack tecnológica

| Camada              | Tecnologia                          |
|---------------------|-------------------------------------|
| Frontend            | Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui |
| Backend             | Next.js Server Actions + API Routes |
| Banco de dados      | Prisma ORM + SQLite (dev) / PostgreSQL (prod) |
| Autenticação        | Auth.js (NextAuth v5) com roles     |
| Geração de PDF      | @react-pdf/renderer                 |
| Storage de arquivos | Local (dev) / Supabase Storage (prod) |
| Deploy recomendado  | Vercel + Supabase                   |

## Estrutura do projeto

```
Projeto-sgs-/
├── app/                    # App Router (páginas e layouts)
│   ├── (auth)/             # Login, registro
│   ├── (dashboard)/        # Área logada
│   │   ├── empresas/
│   │   ├── clinicas/
│   │   ├── colaboradores/
│   │   ├── pgr/
│   │   ├── pcmso/
│   │   ├── exames/
│   │   └── aso/
│   └── api/                # API routes
├── components/             # Componentes reutilizáveis
│   ├── ui/                 # shadcn/ui
│   ├── forms/
│   ├── documents/          # Templates de PDF (PGR, PCMSO, ASO)
│   └── layout/
├── lib/                    # Utilitários, auth, prisma client
├── prisma/                 # Schema e migrations
├── types/                  # Tipos TypeScript
└── public/
```

## Como rodar localmente

```bash
# 1. Clone o repositório
git clone https://github.com/isaquebrito6-cmyk/Projeto-sgs-.git
cd Projeto-sgs-

# 2. Instale as dependências
npm install

# 3. Configure o banco (SQLite por padrão)
cp .env.example .env

# 4. Gere o cliente Prisma e rode as migrations
npx prisma generate
npx prisma db push

# 5. (Opcional) Popule com dados de exemplo
npx prisma db seed

# 6. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## Roadmap de desenvolvimento

### Fase 1 — Fundação (atual)
- [x] Scaffold Next.js + TypeScript + Tailwind
- [x] Schema Prisma completo
- [ ] Autenticação e controle de roles
- [ ] Layout responsivo + dashboard base

### Fase 2 — Cadastros
- [ ] Empresas
- [ ] Clínicas e médicos
- [ ] Colaboradores + setores + funções
- [ ] Riscos ocupacionais e GHEs

### Fase 3 — PGR
- [ ] Wizard de inventário de riscos
- [ ] Classificação e medidas de controle
- [ ] Plano de Ação
- [ ] Geração do PDF do PGR (conforme NR-1/NR-9)

### Fase 4 — PCMSO
- [ ] Vinculação automática aos riscos do PGR
- [ ] Definição de exames e periodicidade
- [ ] Geração do PDF do PCMSO (conforme NR-7)

### Fase 5 — Fluxo de Exames e ASO
- [ ] Solicitação de exames pela empresa
- [ ] Formulário ASO + checklist psicossocial
- [ ] Edição e assinatura pela clínica
- [ ] Upload e acesso pela empresa
- [ ] Alertas de vencimento

### Fase 6 — Produção
- [ ] Migração para PostgreSQL + Supabase
- [ ] Deploy na Vercel
- [ ] Testes e refinamentos de UX

## Conformidade legal

O sistema é projetado para gerar documentos alinhados às seguintes normas:

- **NR-1** — Disposições Gerais e Gerenciamento de Riscos Ocupacionais (PGR)
- **NR-7** — Programa de Controle Médico de Saúde Ocupacional (PCMSO) e ASO
- **NR-9** — Avaliação e Controle das Exposições Ocupacionais a Agentes Físicos, Químicos e Biológicos

> **Aviso importante**: Os documentos gerados devem sempre ser revisados e assinados por profissional legalmente habilitado (Engenheiro/Técnico de Segurança do Trabalho e Médico do Trabalho). O sistema é uma ferramenta de apoio à gestão e documentação.

## Licença

Projeto privado — todos os direitos reservados.
