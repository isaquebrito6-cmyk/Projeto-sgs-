"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export type EmpresaFormData = {
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  inscricaoEstadual?: string;
  endereco?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  grauRisco?: number;
  cnae?: string;
  numeroFuncionarios?: number;
};

function cleanCNPJ(cnpj: string) {
  return cnpj.replace(/\D/g, "");
}

export async function listEmpresas() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  return prisma.empresa.findMany({
    where: { ativo: true },
    orderBy: { razaoSocial: "asc" },
    include: {
      _count: {
        select: { colaboradores: true, pgrs: true },
      },
    },
  });
}

export async function getEmpresa(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  return prisma.empresa.findUnique({
    where: { id },
    include: {
      _count: {
        select: { colaboradores: true, pgrs: true, setores: true },
      },
    },
  });
}

export async function createEmpresa(data: EmpresaFormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  const cnpj = cleanCNPJ(data.cnpj);

  const existing = await prisma.empresa.findUnique({ where: { cnpj } });
  if (existing) {
    return { error: "Já existe uma empresa cadastrada com este CNPJ." };
  }

  const empresa = await prisma.empresa.create({
    data: {
      razaoSocial: data.razaoSocial.trim(),
      nomeFantasia: data.nomeFantasia?.trim() || null,
      cnpj,
      inscricaoEstadual: data.inscricaoEstadual?.trim() || null,
      endereco: data.endereco?.trim() || null,
      cidade: data.cidade?.trim() || null,
      uf: data.uf?.trim()?.toUpperCase() || null,
      cep: data.cep?.replace(/\D/g, "") || null,
      telefone: data.telefone?.trim() || null,
      email: data.email?.trim() || null,
      grauRisco: data.grauRisco || null,
      cnae: data.cnae?.trim() || null,
      numeroFuncionarios: data.numeroFuncionarios || null,
    },
  });

  revalidatePath("/empresas");
  return { success: true, id: empresa.id };
}

export async function updateEmpresa(id: string, data: EmpresaFormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  const cnpj = cleanCNPJ(data.cnpj);

  const existing = await prisma.empresa.findFirst({
    where: { cnpj, NOT: { id } },
  });
  if (existing) {
    return { error: "Já existe outra empresa cadastrada com este CNPJ." };
  }

  await prisma.empresa.update({
    where: { id },
    data: {
      razaoSocial: data.razaoSocial.trim(),
      nomeFantasia: data.nomeFantasia?.trim() || null,
      cnpj,
      inscricaoEstadual: data.inscricaoEstadual?.trim() || null,
      endereco: data.endereco?.trim() || null,
      cidade: data.cidade?.trim() || null,
      uf: data.uf?.trim()?.toUpperCase() || null,
      cep: data.cep?.replace(/\D/g, "") || null,
      telefone: data.telefone?.trim() || null,
      email: data.email?.trim() || null,
      grauRisco: data.grauRisco || null,
      cnae: data.cnae?.trim() || null,
      numeroFuncionarios: data.numeroFuncionarios || null,
    },
  });

  revalidatePath("/empresas");
  revalidatePath(`/empresas/${id}`);
  return { success: true };
}

export async function deleteEmpresa(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  // Soft delete
  await prisma.empresa.update({
    where: { id },
    data: { ativo: false },
  });

  revalidatePath("/empresas");
  return { success: true };
}
