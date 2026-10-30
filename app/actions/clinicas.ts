"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export type ClinicaFormData = {
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  endereco?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  telefone?: string;
  email?: string;
};

export type MedicoFormData = {
  nome: string;
  crm: string;
  crmUf: string;
  especialidade?: string;
  telefone?: string;
  email?: string;
  clinicaId: string;
};

function cleanCNPJ(cnpj: string) {
  return cnpj.replace(/\D/g, "");
}

export async function listClinicas() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  return prisma.clinica.findMany({
    where: { ativo: true },
    orderBy: { razaoSocial: "asc" },
    include: {
      _count: { select: { medicos: true, asos: true } },
    },
  });
}

export async function getClinica(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  return prisma.clinica.findUnique({
    where: { id },
    include: {
      medicos: { where: { ativo: true }, orderBy: { nome: "asc" } },
      _count: { select: { medicos: true, asos: true, solicitacoesExame: true } },
    },
  });
}

export async function createClinica(data: ClinicaFormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  const cnpj = cleanCNPJ(data.cnpj);
  const existing = await prisma.clinica.findUnique({ where: { cnpj } });
  if (existing) return { error: "Já existe uma clínica com este CNPJ." };

  const clinica = await prisma.clinica.create({
    data: {
      razaoSocial: data.razaoSocial.trim(),
      nomeFantasia: data.nomeFantasia?.trim() || null,
      cnpj,
      endereco: data.endereco?.trim() || null,
      cidade: data.cidade?.trim() || null,
      uf: data.uf?.trim()?.toUpperCase() || null,
      cep: data.cep?.replace(/\D/g, "") || null,
      telefone: data.telefone?.trim() || null,
      email: data.email?.trim() || null,
    },
  });

  revalidatePath("/clinicas");
  return { success: true, id: clinica.id };
}

export async function updateClinica(id: string, data: ClinicaFormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  const cnpj = cleanCNPJ(data.cnpj);
  const existing = await prisma.clinica.findFirst({ where: { cnpj, NOT: { id } } });
  if (existing) return { error: "Já existe outra clínica com este CNPJ." };

  await prisma.clinica.update({
    where: { id },
    data: {
      razaoSocial: data.razaoSocial.trim(),
      nomeFantasia: data.nomeFantasia?.trim() || null,
      cnpj,
      endereco: data.endereco?.trim() || null,
      cidade: data.cidade?.trim() || null,
      uf: data.uf?.trim()?.toUpperCase() || null,
      cep: data.cep?.replace(/\D/g, "") || null,
      telefone: data.telefone?.trim() || null,
      email: data.email?.trim() || null,
    },
  });

  revalidatePath("/clinicas");
  revalidatePath(`/clinicas/${id}`);
  return { success: true };
}

export async function deleteClinica(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  await prisma.clinica.update({ where: { id }, data: { ativo: false } });
  revalidatePath("/clinicas");
  return { success: true };
}

export async function createMedico(data: MedicoFormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  const medico = await prisma.medico.create({
    data: {
      nome: data.nome.trim(),
      crm: data.crm.trim(),
      crmUf: data.crmUf.trim().toUpperCase(),
      especialidade: data.especialidade?.trim() || "Medicina do Trabalho",
      telefone: data.telefone?.trim() || null,
      email: data.email?.trim() || null,
      clinicaId: data.clinicaId,
    },
  });

  revalidatePath(`/clinicas/${data.clinicaId}`);
  return { success: true, id: medico.id };
}

export async function deleteMedico(id: string, clinicaId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  await prisma.medico.update({ where: { id }, data: { ativo: false } });
  revalidatePath(`/clinicas/${clinicaId}`);
  return { success: true };
}
