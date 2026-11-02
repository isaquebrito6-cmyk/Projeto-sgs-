"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, assertEmpresaAccess, empresaIdFilter } from "@/lib/tenant";

export type TreinamentoFormData = {
  titulo: string;
  tipo: string;
  empresaId: string;
  catalogoId?: string;
  cargaHoraria?: string;
  dataRealizacao?: string;
  validade?: string;
  instrutor?: string;
  local?: string;
  conteudo?: string;
  observacoes?: string;
  materialUrl?: string;
  colaboradorIds?: string[];
};

export async function listTreinamentos(empresaId?: string) {
  try {
    const user = await requireUser();
    const scoped = empresaIdFilter(user);
    const filterEmpresa = scoped || empresaId;

    return await prisma.treinamento.findMany({
      where: filterEmpresa ? { empresaId: filterEmpresa } : {},
      orderBy: { dataRealizacao: "desc" },
      include: {
        empresa: { select: { id: true, razaoSocial: true, nomeFantasia: true } },
        _count: { select: { participantes: true } },
      },
    });
  } catch (err) {
    console.error("[listTreinamentos]", err);
    return [];
  }
}

export async function getTreinamento(id: string) {
  try {
    const user = await requireUser();
    const t = await prisma.treinamento.findUnique({
      where: { id },
      include: {
        empresa: true,
        participantes: {
          include: {
            colaborador: {
              select: { id: true, nome: true, cpf: true, funcao: { select: { nome: true } } },
            },
          },
        },
      },
    });
    if (!t) return null;
    assertEmpresaAccess(user, t.empresaId);
    return t;
  } catch {
    return null;
  }
}

export async function createTreinamento(data: TreinamentoFormData) {
  try {
    const user = await requireUser();
    assertEmpresaAccess(user, data.empresaId);

    if (!data.titulo?.trim()) return { error: "Título é obrigatório." };

    // Se não informou materialUrl, tenta usar o cadastrado para o catálogo
    let materialUrl = data.materialUrl?.trim() || null;
    if (!materialUrl && data.catalogoId) {
      const mat = await prisma.materialTreinamento.findUnique({
        where: {
          empresaId_catalogoId: {
            empresaId: data.empresaId,
            catalogoId: data.catalogoId,
          },
        },
      });
      if (mat) materialUrl = mat.url;
    }

    const t = await prisma.treinamento.create({
      data: {
        titulo: data.titulo.trim(),
        tipo: data.tipo?.trim() || "Treinamento",
        catalogoId: data.catalogoId || null,
        empresaId: data.empresaId,
        cargaHoraria: data.cargaHoraria ? parseInt(data.cargaHoraria, 10) : null,
        dataRealizacao: data.dataRealizacao ? new Date(data.dataRealizacao) : null,
        validade: data.validade ? new Date(data.validade) : null,
        instrutor: data.instrutor?.trim() || null,
        local: data.local?.trim() || null,
        conteudo: data.conteudo?.trim() || null,
        observacoes: data.observacoes?.trim() || null,
        materialUrl,
        participantes: data.colaboradorIds?.length
          ? {
              create: data.colaboradorIds.map((colaboradorId) => ({
                colaboradorId,
                presente: true,
              })),
            }
          : undefined,
      },
    });

    revalidatePath("/treinamentos");
    return { success: true, id: t.id };
  } catch (err) {
    console.error("[createTreinamento]", err);
    return { error: "Erro ao criar treinamento." };
  }
}

export async function deleteTreinamento(id: string) {
  try {
    const user = await requireUser();
    const t = await prisma.treinamento.findUnique({ where: { id } });
    if (!t) return { error: "Não encontrado." };
    assertEmpresaAccess(user, t.empresaId);
    await prisma.treinamento.delete({ where: { id } });
    revalidatePath("/treinamentos");
    return { success: true };
  } catch {
    return { error: "Erro ao excluir." };
  }
}
