"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, assertEmpresaAccess, empresaIdFilter } from "@/lib/tenant";
import {
  montarCaracterizacaoProcessos,
  metodologiaAvaliacaoPadraoNR1,
  type EmpresaPGRSnapshot,
} from "@/lib/pgr-nr1";
import type { InventarioItemData } from "@/app/actions/pgr";
import type { NivelRisco, TipoRisco } from "@prisma/client";

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

/**
 * Garante um PGR "vivo" da empresa para receber o inventário independente.
 * Reutiliza o mais recente não vencido; se não houver, cria rascunho com dados da empresa.
 */
export async function garantirPGRParaInventario(empresaId: string) {
  const user = await requireUser();
  assertEmpresaAccess(user, empresaId);

  const existente = await prisma.pGR.findFirst({
    where: { empresaId, status: { not: "VENCIDO" } },
    orderBy: { dataElaboracao: "desc" },
  });
  if (existente) return existente;

  const snap = await snapshotEmpresa(empresaId);
  const titulo = snap
    ? `PGR — ${snap.nomeFantasia || snap.razaoSocial}`
    : "Programa de Gerenciamento de Riscos";

  return prisma.pGR.create({
    data: {
      titulo,
      empresaId,
      versao: "1.0",
      status: "RASCUNHO",
      caracterizacaoProcessos: snap ? montarCaracterizacaoProcessos(snap) : null,
      metodologiaAvaliacao: metodologiaAvaliacaoPadraoNR1(),
    },
  });
}

export async function getInventarioEmpresa(empresaId: string) {
  const user = await requireUser();
  assertEmpresaAccess(user, empresaId);

  const pgr = await garantirPGRParaInventario(empresaId);

  const full = await prisma.pGR.findUnique({
    where: { id: pgr.id },
    include: {
      empresa: {
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
      },
      inventarioItens: {
        include: { risco: true },
        orderBy: { createdAt: "asc" },
      },
      pcmso: { select: { id: true, titulo: true } },
    },
  });

  return full;
}

export async function listEmpresasParaInventario() {
  const user = await requireUser();
  const scoped = empresaIdFilter(user);

  return prisma.empresa.findMany({
    where: {
      ativo: true,
      ...(scoped ? { id: scoped } : {}),
    },
    orderBy: { razaoSocial: "asc" },
    select: {
      id: true,
      razaoSocial: true,
      nomeFantasia: true,
      grauRisco: true,
      cnae: true,
      _count: {
        select: {
          pgrs: true,
          setores: true,
          colaboradores: true,
        },
      },
    },
  });
}

export async function addRiscoInventarioEmpresa(
  empresaId: string,
  data: InventarioItemData
) {
  const user = await requireUser();
  assertEmpresaAccess(user, empresaId);

  if (!data.riscoNome?.trim()) return { error: "Informe o nome do risco." };

  const pgr = await garantirPGRParaInventario(empresaId);

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
        empresaId,
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
      pgrId: pgr.id,
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

  revalidatePath("/inventario");
  revalidatePath("/pgr");
  revalidatePath(`/pgr/${pgr.id}`);
  revalidatePath("/pcmso");
  revalidatePath("/exames");
  return { success: true, pgrId: pgr.id };
}

export async function removeRiscoInventarioEmpresa(itemId: string, empresaId: string) {
  const user = await requireUser();
  assertEmpresaAccess(user, empresaId);

  const item = await prisma.inventarioRiscoItem.findUnique({
    where: { id: itemId },
    include: { pgr: true },
  });
  if (!item || item.pgr.empresaId !== empresaId) {
    return { error: "Item não encontrado." };
  }

  await prisma.inventarioRiscoItem.delete({ where: { id: itemId } });

  revalidatePath("/inventario");
  revalidatePath("/pgr");
  revalidatePath(`/pgr/${item.pgrId}`);
  return { success: true };
}

/** Texto consolidado dos riscos para solicitação de exame / ASO */
export async function riscosTextoParaExames(empresaId: string) {
  const user = await requireUser();
  assertEmpresaAccess(user, empresaId);

  const pgr = await prisma.pGR.findFirst({
    where: { empresaId, status: { not: "VENCIDO" } },
    orderBy: { dataElaboracao: "desc" },
    include: { inventarioItens: { include: { risco: true } } },
  });

  if (!pgr?.inventarioItens.length) return "";

  return pgr.inventarioItens
    .map(
      (i) =>
        `${i.risco.nome} (${i.risco.tipo})${i.nivelRisco ? ` — ${i.nivelRisco}` : ""}${i.setorNome ? ` [${i.setorNome}]` : ""}`
    )
    .join("; ");
}
