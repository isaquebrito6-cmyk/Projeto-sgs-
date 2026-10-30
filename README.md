# SGS — Sistema de Gestão em Segurança do Trabalho

Sistema profissional de gestão de SST focado em **Medicina Ocupacional**, documentação e conformidade com as Normas Regulamentadoras do **Ministério do Trabalho e Emprego (MTE)**.

## Conformidade com as NRs

| Norma | Aplicação no sistema |
|-------|----------------------|
| **NR-1** | PGR: Inventário de Riscos Ocupacionais + Plano de Ação (itens 1.5.3 e 1.5.7) |
| **NR-7** | PCMSO vinculado aos riscos do PGR; ASO com todos os campos do item **7.5.19.1** (alíneas a–g); tipos de exame 7.5.8–7.5.11 |
| **NR-9** | Avaliação e controle de agentes físicos, químicos e biológicos integrados ao inventário do PGR (itens 9.4.3 e 9.5.3) |

### ASO — conteúdo mínimo (NR-7, 7.5.19.1)

- **a)** Razão social e CNPJ/CAEPF da organização  
- **b)** Nome completo, CPF e função do empregado  
- **c)** Perigos/fatores de risco do PGR que necessitam controle médico no PCMSO (ou inexistência)  
- **d)** Indicação e data dos exames clínicos e complementares  
- **e)** Conclusão: APTO ou INAPTO para a função  
- **f)** Nome e registro do médico responsável pelo PCMSO  
- **g)** Data, registro e assinatura do médico examinador  

Aptidões específicas (NR-10, NR-33, NR-35 etc.) podem ser registradas conforme item 7.5.19.2.

> **Aviso:** Os documentos gerados devem ser revisados e assinados por profissional legalmente habilitado (Engenheiro/Técnico de Segurança do Trabalho e Médico do Trabalho). O sistema é ferramenta de apoio à gestão e documentação.

## Funcionalidades

- **PGR** — Wizard de inventário (tipo de risco, probabilidade × severidade, nível, GHE/setor/função, medidas existentes) + Plano de Ação
- **PCMSO** — Vinculado ao PGR; exames padrão gerados automaticamente conforme riscos (audiometria, espirometria etc.)
- **Exames / ASO** — Solicitação (admissional, periódico, retorno, mudança de risco, demissional) → clínica emite ASO → impressão/PDF conforme NR-7
- Cadastros: Empresas, Setores, Funções, Colaboradores, Clínicas, Médicos
- Interface 100% responsiva
- Autenticação com roles (Admin, Empresa, Clínica, Médico)

## Stack

Next.js 15 · TypeScript · Tailwind · Prisma · Auth.js · SQLite (dev)

## Como rodar

```bash
git clone https://github.com/isaquebrito6-cmyk/Projeto-sgs-.git
cd Projeto-sgs-
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

Acesse: http://localhost:3000  

**Login demo:** `admin@sgs.local` / `admin123`

## Fluxo recomendado de uso

1. Cadastrar **Empresa** (CNPJ, grau de risco NR-4, CNAE)
2. Criar **Setores** e **Funções** na página da empresa
3. Cadastrar **Colaboradores** vinculados a setor/função
4. Elaborar **PGR** → inventário de riscos + plano de ação
5. Gerar **PCMSO** vinculado ao PGR (exames automáticos conforme riscos)
6. Cadastrar **Clínica** e **Médicos**
7. **Solicitar exame** → clínica emite **ASO** → imprimir/salvar PDF

## Estrutura

```
app/
  (dashboard)/
    empresas/          # CRUD + setores/funções
    clinicas/          # CRUD + médicos
    colaboradores/     # CRUD vinculado a empresa/setor/função
    pgr/               # Inventário + Plano de Ação (NR-1/NR-9)
    pcmso/             # Exames por tipo (NR-7)
    exames/            # Solicitações + emissão e impressão de ASO
prisma/schema.prisma   # Modelos alinhados às NRs
```

## Licença

Projeto privado — todos os direitos reservados.
