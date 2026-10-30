"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
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

export async function listPGRs(empresaId?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  return prisma.pGR.findMany({
    where: empresaId ? { empresaId } : undefined,
    orderBy: { dataElaboracao: "desc" },
    include: {
      empresa: { select: { id: true, razaoSocial: true, nomeFantasia: true } },
      _count: { select: { inventarioItens: true, planoAcaoItens: true } },
      pcmso: { select: { id: true } },
    },
  });
}

export async function getPGR(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  return prisma.pGR.findUnique({
    where: { id },
    include: {
      empresa: true,
      inventarioItens: {
        include: { risco: true },
        orderBy: { createdAt: "asc" },
      },
      planoAcaoItens: { orderBy: { createdAt: "asc" } },
      pcmso: true,
    },
  });
}

export async function createPGR(data: PGRFormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  const pgr = await prisma.pGR.create({
    data: {
      titulo: data.titulo.trim(),
      empresaId: data.empresaId,
      versao: data.versao || "1.0",
      elaboradorNome: data.elaboradorNome?.trim() || null,
      elaboradorRegistro: data.elaboradorRegistro?.trim() || null,
      caracterizacaoProcessos: data.caracterizacaoProcessos?.trim() || null,
      metodologiaAvaliacao: data.metodologiaAvaliacao?.trim() || null,
      observacoes: data.observacoes?.trim() || null,
      status: "RASCUNHO",
    },
  });

  revalidatePath("/pgr");
  return { success: true, id: pgr.id };
}

export async function updatePGR(id: string, data: Partial<PGRFormData> & { status?: string }) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

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

export async function addInventarioItem(pgrId: string, data: InventarioItemData) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

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

  const nivel = data.nivelRisco || calcNivel(data.probabilidade, data.severidade);

  await prisma.inventarioRiscoItem.create({
    data: {
      pgrId,
      riscoId,
      setorNome: data.setorNome || null,
      funcaoNome: data.funcaoNome || null,
      fonteGeradora: data.fonteGeradora || null,
      numeroExpostos: data.numeroExpostos || null,
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
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  await prisma.inventarioRiscoItem.delete({ where: { id } });
  revalidatePath(`/pgr/${pgrId}`);
  return { success: true };
}

export async function addPlanoAcaoItem(pgrId: string, data: PlanoAcaoData) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

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
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  await prisma.planoAcaoItem.delete({ where: { id } });
  revalidatePath(`/pgr/${pgrId}`);
  return { success: true };
}

export async function updatePlanoAcaoStatus(id: string, status: string, pgrId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  await prisma.planoAcaoItem.update({ where: { id }, data: { status } });
  revalidatePath(`/pgr/${pgrId}`);
  return { success: true };
}
