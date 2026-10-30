"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function listSetores(empresaId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  return prisma.setor.findMany({
    where: { empresaId },
    orderBy: { nome: "asc" },
    include: {
      funcoes: { orderBy: { nome: "asc" } },
      _count: { select: { colaboradores: true } },
    },
  });
}

export async function createSetor(empresaId: string, nome: string, descricao?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  const setor = await prisma.setor.create({
    data: {
      nome: nome.trim(),
      descricao: descricao?.trim() || null,
      empresaId,
    },
  });

  revalidatePath(`/empresas/${empresaId}`);
  revalidatePath("/colaboradores");
  return { success: true, id: setor.id };
}

export async function updateSetor(id: string, nome: string, descricao?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  const setor = await prisma.setor.update({
    where: { id },
    data: {
      nome: nome.trim(),
      descricao: descricao?.trim() || null,
    },
  });

  revalidatePath(`/empresas/${setor.empresaId}`);
  revalidatePath("/colaboradores");
  return { success: true };
}

export async function deleteSetor(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  const setor = await prisma.setor.delete({ where: { id } });
  revalidatePath(`/empresas/${setor.empresaId}`);
  revalidatePath("/colaboradores");
  return { success: true };
}

export async function createFuncao(
  setorId: string,
  nome: string,
  descricao?: string,
  cbo?: string
) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  const funcao = await prisma.funcao.create({
    data: {
      nome: nome.trim(),
      descricao: descricao?.trim() || null,
      cbo: cbo?.trim() || null,
      setorId,
    },
    include: { setor: true },
  });

  revalidatePath(`/empresas/${funcao.setor.empresaId}`);
  revalidatePath("/colaboradores");
  return { success: true, id: funcao.id };
}

export async function updateFuncao(
  id: string,
  nome: string,
  descricao?: string,
  cbo?: string
) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  const funcao = await prisma.funcao.update({
    where: { id },
    data: {
      nome: nome.trim(),
      descricao: descricao?.trim() || null,
      cbo: cbo?.trim() || null,
    },
    include: { setor: true },
  });

  revalidatePath(`/empresas/${funcao.setor.empresaId}`);
  revalidatePath("/colaboradores");
  return { success: true };
}

export async function deleteFuncao(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  const funcao = await prisma.funcao.delete({
    where: { id },
    include: { setor: true },
  });

  revalidatePath(`/empresas/${funcao.setor.empresaId}`);
  revalidatePath("/colaboradores");
  return { success: true };
}

export async function listFuncoesByEmpresa(empresaId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  return prisma.funcao.findMany({
    where: { setor: { empresaId } },
    orderBy: { nome: "asc" },
    include: { setor: true },
  });
}
