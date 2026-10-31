"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  requireUser,
  isAdmin,
  assertClinicaAccess,
  clinicaIdFilter,
} from "@/lib/tenant";

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
  const user = await requireUser();
  const cid = clinicaIdFilter(user);

  return prisma.clinica.findMany({
    where: {
      ativo: true,
      ...(cid ? { id: cid } : {}),
    },
    orderBy: { razaoSocial: "asc" },
    include: {
      _count: { select: { medicos: true, asos: true } },
    },
  });
}

export async function getClinica(id: string) {
  const user = await requireUser();
  assertClinicaAccess(user, id);

  return prisma.clinica.findUnique({
    where: { id },
    include: {
      medicos: { where: { ativo: true }, orderBy: { nome: "asc" } },
      _count: { select: { medicos: true, asos: true, solicitacoesExame: true } },
    },
  });
}

export async function createClinica(data: ClinicaFormData) {
  const user = await requireUser();
  if (!isAdmin(user)) {
    return { error: "Apenas administrador pode cadastrar novas clínicas." };
  }

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
  const user = await requireUser();
  assertClinicaAccess(user, id);

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
  const user = await requireUser();
  if (!isAdmin(user)) return { error: "Apenas administrador pode inativar clínicas." };

  await prisma.clinica.update({ where: { id }, data: { ativo: false } });
  revalidatePath("/clinicas");
  return { success: true };
}

export async function createMedico(data: MedicoFormData) {
  const user = await requireUser();
  assertClinicaAccess(user, data.clinicaId);

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
  const user = await requireUser();
  assertClinicaAccess(user, clinicaId);

  await prisma.medico.update({ where: { id }, data: { ativo: false } });
  revalidatePath(`/clinicas/${clinicaId}`);
  return { success: true };
}
