"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, assertEmpresaAccess, empresaIdFilter } from "@/lib/tenant";
import {
  montarCaracterizacaoProcessos,
  metodologiaAvaliacaoPadraoNR1,
  type EmpresaPGRSnapshot,
} from "@/lib/pgr-nr1";
import type { NivelRisco, TipoRisco } from "@prisma/client";

export type PGRFormData = {
  titulo: string;
  empresaId: string;
  versao?: string;
  elaboradorNome?: string;
  elaboradorRegistro?: string;
  caracterizacaoProcessos?: string;
  metodologiaAvaliacao?: string;
  observacoes?: string;
};

export type InventarioItemData = {
  riscoId?: string;
  riscoNome: string;
  tipoRisco: TipoRisco;
  setorNome?: string;
  funcaoNome?: string;
  gheNome?: string;
  fonteGeradora?: string;
  numeroExpostos?: number;
  tipoExposicao?: string;
  probabilidade?: number;
  severidade?: number;
  nivelRisco?: NivelRisco;
  medidasExistentes?: string;
  necessidadeAvaliacaoQuantitativa?: boolean;
  observacoes?: string;
};

export type PlanoAcaoData = {
  descricaoAcao: string;
  riscoRelacionado?: string;
  responsavel?: string;
  prazo?: string;
  status?: string;
  prioridade?: string;
  observacoes?: string;
};

function calcNivel(prob?: number, sev?: number): NivelRisco | undefined {
  if (!prob || !sev) return undefined;
  const score = prob * sev;
  if (score <= 4) return "BAIXO";
  if (score <= 9) return "MEDIO";
  if (score <= 16) return "ALTO";
  return "MUITO_ALTO";
}

async function snapshotEmpresa(empresaId: string): Promise<EmpresaPGRSnapshot | null> {
  const emp = await prisma.empresa.findUnique({
    where: { id: empresaId },
    include: {
      setores: {
        orderBy: { nome: "asc" },
        include: {
          funcoes: { orderBy: { nome: "asc" } },
          ghes: { orderBy: { nome: "asc" } },
          _count: { select: { colaboradores: true } },
        },
      },
    },
  });
  if (!emp) return null;

  return {
    razaoSocial: emp.razaoSocial,
    nomeFantasia: emp.nomeFantasia,
    cnpj: emp.cnpj,
    cnae: emp.cnae,
    grauRisco: emp.grauRisco,
    numeroFuncionarios: emp.numeroFuncionarios,
    endereco: emp.endereco,
    cidade: emp.cidade,
    uf: emp.uf,
    setores: emp.setores.map((s) => ({
      nome: s.nome,
      descricao: s.descricao,
      nColaboradores: s._count.colaboradores,
      funcoes: s.funcoes.map((f) => f.nome),
      ghes: s.ghes.map((g) => ({ nome: g.nome, descricao: g.descricao })),
    })),
  };
}

export async function listPGRs(empresaId?: string) {
  const user = await requireUser();
  const scoped = empresaIdFilter(user);
  const filter = scoped || empresaId;

  return prisma.pGR.findMany({
    where: filter ? { empresaId: filter } : undefined,
    orderBy: { dataElaboracao: "desc" },
    include: {
      empresa: {
        select: {
          id: true,
          razaoSocial: true,
          nomeFantasia: true,
          grauRisco: true,
          cnae: true,
        },
      },
      _count: { select: { inventarioItens: true, planoAcaoItens: true } },
      pcmso: { select: { id: true } },
    },
  });
}

export async function getPGR(id: string) {
  const user = await requireUser();

  const pgr = await prisma.pGR.findUnique({
    where: { id },
    include: {
      empresa: {
        include: {
          setores: {
            orderBy: { nome: "asc" },
            include: {
              funcoes: {
                orderBy: { nome: "asc" },
                select: { id: true, nome: true, setorId: true },
              },
              ghes: {
                orderBy: { nome: "asc" },
                select: { id: true, nome: true, descricao: true, setorId: true },
              },
              _count: { select: { colaboradores: true } },
            },
          },
        },
      },
      inventarioItens: { include: { risco: true }, orderBy: { createdAt: "asc" } },
      planoAcaoItens: { orderBy: { createdAt: "asc" } },
      pcmso: true,
    },
  });

  if (!pgr) return null;
  assertEmpresaAccess(user, pgr.empresaId);
  return pgr;
}

/** Preview para o formulário de novo PGR — puxa empresa, GR, setores, GHE */
export async function getEmpresaEstruturaParaPGR(empresaId: string) {
  const user = await requireUser();
  assertEmpresaAccess(user, empresaId);
  return snapshotEmpresa(empresaId);
}

export async function createPGR(data: PGRFormData) {
  const user = await requireUser();
  assertEmpresaAccess(user, data.empresaId);

  const snap = await snapshotEmpresa(data.empresaId);
  const caracterizacao =
    data.caracterizacaoProcessos?.trim() ||
    (snap ? montarCaracterizacaoProcessos(snap) : "");
  const metodologia =
    data.metodologiaAvaliacao?.trim() || metodologiaAvaliacaoPadraoNR1();

  const titulo =
    data.titulo.trim() ||
    (snap
      ? `PGR — ${snap.nomeFantasia || snap.razaoSocial}`
      : "Programa de Gerenciamento de Riscos");

  const pgr = await prisma.pGR.create({
    data: {
      titulo,
      empresaId: data.empresaId,
      versao: data.versao || "1.0",
      elaboradorNome: data.elaboradorNome?.trim() || null,
      elaboradorRegistro: data.elaboradorRegistro?.trim() || null,
      caracterizacaoProcessos: caracterizacao || null,
      metodologiaAvaliacao: metodologia,
      observacoes: data.observacoes?.trim() || null,
      status: "RASCUNHO",
    },
  });

  revalidatePath("/pgr");
  return { success: true, id: pgr.id };
}

export async function updatePGR(id: string, data: Partial<PGRFormData> & { status?: string }) {
  const user = await requireUser();
  const atual = await prisma.pGR.findUnique({ where: { id } });
  if (!atual) return { error: "PGR não encontrado." };
  assertEmpresaAccess(user, atual.empresaId);

  await prisma.pGR.update({
    where: { id },
    data: {
      titulo: data.titulo?.trim(),
      versao: data.versao,
      elaboradorNome: data.elaboradorNome?.trim() || null,
      elaboradorRegistro: data.elaboradorRegistro?.trim() || null,
      caracterizacaoProcessos: data.caracterizacaoProcessos?.trim() || null,
      metodologiaAvaliacao: data.metodologiaAvaliacao?.trim() || null,
      observacoes: data.observacoes?.trim() || null,
      status: data.status as any,
    },
  });

  revalidatePath("/pgr");
  revalidatePath(`/pgr/${id}`);
  return { success: true };
}

/** Atualiza caracterização do PGR puxando de novo os dados atuais da empresa */
export async function sincronizarCaracterizacaoPGR(pgrId: string) {
  const user = await requireUser();
  const pgr = await prisma.pGR.findUnique({ where: { id: pgrId } });
  if (!pgr) return { error: "PGR não encontrado." };
  assertEmpresaAccess(user, pgr.empresaId);

  const snap = await snapshotEmpresa(pgr.empresaId);
  if (!snap) return { error: "Empresa não encontrada." };

  await prisma.pGR.update({
    where: { id: pgrId },
    data: {
      caracterizacaoProcessos: montarCaracterizacaoProcessos(snap),
      metodologiaAvaliacao: pgr.metodologiaAvaliacao || metodologiaAvaliacaoPadraoNR1(),
    },
  });

  revalidatePath(`/pgr/${pgrId}`);
  return { success: true };
}

export async function addInventarioItem(pgrId: string, data: InventarioItemData) {
  const user = await requireUser();
  const pgr = await prisma.pGR.findUnique({ where: { id: pgrId } });
  if (!pgr) return { error: "PGR não encontrado." };
  assertEmpresaAccess(user, pgr.empresaId);

  let riscoId = data.riscoId;
  if (!riscoId) {
    const risco = await prisma.risco.create({
      data: {
        nome: data.riscoNome.trim(),
        tipo: data.tipoRisco,
        fonteGeradora: data.fonteGeradora || null,
      },
    });
    riscoId = risco.id;
  }

  let numeroExpostos = data.numeroExpostos;
  if (numeroExpostos == null && (data.setorNome || data.funcaoNome)) {
    const count = await prisma.colaborador.count({
      where: {
        empresaId: pgr.empresaId,
        ativo: true,
        ...(data.setorNome ? { setor: { nome: data.setorNome } } : {}),
        ...(data.funcaoNome ? { funcao: { nome: data.funcaoNome } } : {}),
      },
    });
    if (count > 0) numeroExpostos = count;
  }

  const nivel = data.nivelRisco || calcNivel(data.probabilidade, data.severidade);

  await prisma.inventarioRiscoItem.create({
    data: {
      pgrId,
      riscoId,
      setorNome: data.setorNome || null,
      funcaoNome: data.funcaoNome || null,
      gheNome: data.gheNome || null,
      fonteGeradora: data.fonteGeradora || null,
      numeroExpostos: numeroExpostos ?? null,
      tipoExposicao: data.tipoExposicao || null,
      probabilidade: data.probabilidade || null,
      severidade: data.severidade || null,
      nivelRisco: nivel || null,
      medidasExistentes: data.medidasExistentes || null,
      necessidadeAvaliacaoQuantitativa: data.necessidadeAvaliacaoQuantitativa || false,
      observacoes: data.observacoes || null,
    },
  });

  revalidatePath(`/pgr/${pgrId}`);
  return { success: true };
}

export async function removeInventarioItem(id: string, pgrId: string) {
  const user = await requireUser();
  const pgr = await prisma.pGR.findUnique({ where: { id: pgrId } });
  if (!pgr) return { error: "PGR não encontrado." };
  assertEmpresaAccess(user, pgr.empresaId);

  await prisma.inventarioRiscoItem.delete({ where: { id } });
  revalidatePath(`/pgr/${pgrId}`);
  return { success: true };
}

export async function addPlanoAcaoItem(pgrId: string, data: PlanoAcaoData) {
  const user = await requireUser();
  const pgr = await prisma.pGR.findUnique({ where: { id: pgrId } });
  if (!pgr) return { error: "PGR não encontrado." };
  assertEmpresaAccess(user, pgr.empresaId);

  await prisma.planoAcaoItem.create({
    data: {
      pgrId,
      descricaoAcao: data.descricaoAcao.trim(),
      riscoRelacionado: data.riscoRelacionado || null,
      responsavel: data.responsavel || null,
      prazo: data.prazo ? new Date(data.prazo) : null,
      status: data.status || "Pendente",
      prioridade: data.prioridade || null,
      observacoes: data.observacoes || null,
    },
  });

  revalidatePath(`/pgr/${pgrId}`);
  return { success: true };
}

export async function removePlanoAcaoItem(id: string, pgrId: string) {
  const user = await requireUser();
  const pgr = await prisma.pGR.findUnique({ where: { id: pgrId } });
  if (!pgr) return { error: "PGR não encontrado." };
  assertEmpresaAccess(user, pgr.empresaId);

  await prisma.planoAcaoItem.delete({ where: { id } });
  revalidatePath(`/pgr/${pgrId}`);
  return { success: true };
}

export async function updatePlanoAcaoStatus(id: string, status: string, pgrId: string) {
  const user = await requireUser();
  const pgr = await prisma.pGR.findUnique({ where: { id: pgrId } });
  if (!pgr) return { error: "PGR não encontrado." };
  assertEmpresaAccess(user, pgr.empresaId);

  await prisma.planoAcaoItem.update({ where: { id }, data: { status } });
  revalidatePath(`/pgr/${pgrId}`);
  return { success: true };
}

export async function gerarPlanoAcaoDoInventario(pgrId: string) {
  const user = await requireUser();
  const pgr = await prisma.pGR.findUnique({
    where: { id: pgrId },
    include: { inventarioItens: { include: { risco: true } } },
  });
  if (!pgr) return { error: "PGR não encontrado." };
  assertEmpresaAccess(user, pgr.empresaId);

  const prioritarios = pgr.inventarioItens.filter(
    (i) => i.nivelRisco === "ALTO" || i.nivelRisco === "MUITO_ALTO"
  );

  let criados = 0;
  for (const item of prioritarios) {
    const desc = `Controlar/reduzir risco "${item.risco.nome}"${
      item.setorNome ? ` no setor ${item.setorNome}` : ""
    }${item.gheNome ? ` / GHE ${item.gheNome}` : ""}${item.funcaoNome ? ` (função ${item.funcaoNome})` : ""}. Revisar medidas existentes e implementar controles adicionais conforme hierarquia de controles (NR-1).`;

    await prisma.planoAcaoItem.create({
      data: {
        pgrId,
        descricaoAcao: desc,
        riscoRelacionado: item.risco.nome,
        prioridade: item.nivelRisco === "MUITO_ALTO" ? "Alta" : "Média",
        status: "Pendente",
      },
    });
    criados++;
  }

  revalidatePath(`/pgr/${pgrId}`);
  return { success: true, criados };
}
