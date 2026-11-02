"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, assertEmpresaAccess, empresaIdFilter, isAdmin } from "@/lib/tenant";
import { CATALOGO_TREINAMENTOS } from "@/lib/nr-treinamentos";

export async function listMateriais(empresaId?: string) {
  try {
    const user = await requireUser();
    const scoped = empresaIdFilter(user);
    const filterEmpresa = scoped || empresaId;

    const empresas = await prisma.empresa.findMany({
      where: {
        ativo: true,
        ...(filterEmpresa ? { id: filterEmpresa } : isAdmin(user) ? {} : { id: "__none__" }),
      },
      select: {
        id: true,
        razaoSocial: true,
        nomeFantasia: true,
        pastaTreinamentosUrl: true,
        materiaisTreinamento: { orderBy: { norma: "asc" } },
      },
      orderBy: { razaoSocial: "asc" },
    });

    return empresas;
  } catch (err) {
    console.error("[listMateriais]", err);
    return [];
  }
}

export async function updatePastaTreinamentos(empresaId: string, url: string) {
  try {
    const user = await requireUser();
    assertEmpresaAccess(user, empresaId);

    const trimmed = url.trim();
    await prisma.empresa.update({
      where: { id: empresaId },
      data: { pastaTreinamentosUrl: trimmed || null },
    });

    revalidatePath("/treinamentos/materiais");
    revalidatePath(`/empresas/${empresaId}`);
    return { success: true };
  } catch (err) {
    console.error("[updatePastaTreinamentos]", err);
    return { error: "Não foi possível salvar o link da pasta." };
  }
}

export async function upsertMaterialTreinamento(data: {
  empresaId: string;
  catalogoId: string;
  url: string;
  titulo?: string;
  norma?: string;
  descricao?: string;
}) {
  try {
    const user = await requireUser();
    assertEmpresaAccess(user, data.empresaId);

    const url = data.url.trim();
    if (!url) return { error: "Informe a URL do material ou pasta." };

    const cat = CATALOGO_TREINAMENTOS.find((c) => c.id === data.catalogoId);
    const titulo = data.titulo?.trim() || cat?.titulo || data.catalogoId;
    const norma = data.norma?.trim() || cat?.norma || null;

    await prisma.materialTreinamento.upsert({
      where: {
        empresaId_catalogoId: {
          empresaId: data.empresaId,
          catalogoId: data.catalogoId,
        },
      },
      create: {
        empresaId: data.empresaId,
        catalogoId: data.catalogoId,
        titulo,
        norma,
        url,
        descricao: data.descricao?.trim() || null,
      },
      update: {
        titulo,
        norma,
        url,
        descricao: data.descricao?.trim() || null,
      },
    });

    revalidatePath("/treinamentos/materiais");
    return { success: true };
  } catch (err) {
    console.error("[upsertMaterialTreinamento]", err);
    return { error: "Erro ao salvar material." };
  }
}

export async function deleteMaterialTreinamento(id: string) {
  try {
    const user = await requireUser();
    const m = await prisma.materialTreinamento.findUnique({ where: { id } });
    if (!m) return { error: "Não encontrado." };
    assertEmpresaAccess(user, m.empresaId);
    await prisma.materialTreinamento.delete({ where: { id } });
    revalidatePath("/treinamentos/materiais");
    return { success: true };
  } catch {
    return { error: "Erro ao excluir." };
  }
}

export async function getMaterialPorCatalogo(empresaId: string, catalogoId: string) {
  try {
    const user = await requireUser();
    assertEmpresaAccess(user, empresaId);
    const [material, empresa] = await Promise.all([
      prisma.materialTreinamento.findUnique({
        where: { empresaId_catalogoId: { empresaId, catalogoId } },
      }),
      prisma.empresa.findUnique({
        where: { id: empresaId },
        select: { pastaTreinamentosUrl: true },
      }),
    ]);
    return {
      materialUrl: material?.url || null,
      pastaUrl: empresa?.pastaTreinamentosUrl || null,
    };
  } catch {
    return { materialUrl: null, pastaUrl: null };
  }
}
