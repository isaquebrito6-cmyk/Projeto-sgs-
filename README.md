# SGS — Sistema de Gestão em Segurança do Trabalho

Sistema profissional de gestão de SST focado em **Medicina Ocupacional**, documentação e conformidade com as Normas Regulamentadoras do **Ministério do Trabalho e Emprego (MTE)**.

## Status

- Multi-tenant (empresa / clínica isoladas)
- Login admin bootstrap: `isaquebrito6@gmail.com` / `Admin@SGS2026`
- Postgres recomendado em produção (Vercel Postgres ou Neon)
- Deploy: Vercel (`projeto-sgs.vercel.app`)

## Conformidade com as NRs

| Norma | Aplicação no sistema |
|-------|----------------------|
| **NR-1** | PGR: Inventário de Riscos + Plano de Ação |
| **NR-7** | PCMSO + ASO (campos 7.5.19.1) |
| **NR-9** | Riscos físicos, químicos e biológicos no inventário |

## Login

- **Admin:** `isaquebrito6@gmail.com` / `Admin@SGS2026`
- Trocar senha depois com a variável `BOOTSTRAP_PASSWORD` na Vercel

## Stack

Next.js 15 · TypeScript · Tailwind · Prisma · Auth.js · PostgreSQL (prod)

## Fluxo de uso

1. Cadastrar **Empresa**
2. Setores, funções e **Colaboradores**
3. **PGR** → inventário + plano de ação
4. **PCMSO** vinculado ao PGR
5. **Clínica** e solicitação de exames → **ASO**

## Licença

Projeto privado — todos os direitos reservados.
