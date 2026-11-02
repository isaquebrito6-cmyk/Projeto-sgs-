"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, assertEmpresaAccess, empresaIdFilter } from "@/lib/tenant";
import type { TipoCAT, TipoPermissao, StatusOperacional } from "@prisma/client";

// ——— CAT ———

export type CatForm = {
  empresaId: string;
  colaboradorId: string;
  tipo?: TipoCAT;
  dataAcidente: string;
  horaAcidente?: string;
  localAcidente?: string;
  descricao: string;
  parteCorpoAtingida?: string;
  agenteCausador?: string;
  houveAfastamento?: boolean;
  testemunhas?: string;
  observacoes?: string;
  emitidoPor?: string;
};

export async function listCATs(empresaId?: string) {
  const user = await requireUser();
  const scoped = empresaIdFilter(user);
  const filter = scoped || empresaId;
  return prisma.cAT.findMany({
    where: filter ? { empresaId: filter } : {},
    orderBy: { dataAcidente: "desc" },
    include: {
      empresa: { select: { razaoSocial: true, nomeFantasia: true } },
      colaborador: { select: { id: true, nome: true, cpf: true } },
    },
  });
}

export async function getCAT(id: string) {
  const user = await requireUser();
  const cat = await prisma.cAT.findUnique({
    where: { id },
    include: { empresa: true, colaborador: { include: { funcao: true, setor: true } } },
  });
  if (!cat) return null;
  assertEmpresaAccess(user, cat.empresaId);
  return cat;
}

export async function createCAT(data: CatForm) {
  const user = await requireUser();
  assertEmpresaAccess(user, data.empresaId);
  if (!data.descricao?.trim()) return { error: "Descrição do acidente é obrigatória." };

  const cat = await prisma.cAT.create({
    data: {
      empresaId: data.empresaId,
      colaboradorId: data.colaboradorId,
      tipo: data.tipo || "INICIAL",
      status: "EMITIDO",
      dataAcidente: new Date(data.dataAcidente),
      horaAcidente: data.horaAcidente || null,
      localAcidente: data.localAcidente || null,
      descricao: data.descricao.trim(),
      parteCorpoAtingida: data.parteCorpoAtingida || null,
      agenteCausador: data.agenteCausador || null,
      houveAfastamento: !!data.houveAfastamento,
      testemunhas: data.testemunhas || null,
      observacoes: data.observacoes || null,
      emitidoPor: data.emitidoPor || null,
    },
  });
  revalidatePath("/cat");
  return { success: true, id: cat.id };
}

// ——— PT ———

export type PtForm = {
  empresaId: string;
  colaboradorId?: string;
  tipo?: TipoPermissao;
  numero?: string;
  local: string;
  atividade: string;
  dataInicio: string;
  dataFim?: string;
  riscos?: string;
  epiNecessario?: string;
  medidasControle?: string;
  observacoes?: string;
  autorizadoPor?: string;
  executanteNome?: string;
};

export async function listPTs(empresaId?: string) {
  const user = await requireUser();
  const scoped = empresaIdFilter(user);
  const filter = scoped || empresaId;
  return prisma.permissaoTrabalho.findMany({
    where: filter ? { empresaId: filter } : {},
    orderBy: { dataInicio: "desc" },
    include: {
      empresa: { select: { razaoSocial: true, nomeFantasia: true } },
      colaborador: { select: { id: true, nome: true } },
    },
  });
}

export async function getPT(id: string) {
  const user = await requireUser();
  const pt = await prisma.permissaoTrabalho.findUnique({
    where: { id },
    include: { empresa: true, colaborador: true },
  });
  if (!pt) return null;
  assertEmpresaAccess(user, pt.empresaId);
  return pt;
}

export async function createPT(data: PtForm) {
  const user = await requireUser();
  assertEmpresaAccess(user, data.empresaId);
  if (!data.local?.trim() || !data.atividade?.trim()) {
    return { error: "Local e atividade são obrigatórios." };
  }
  const pt = await prisma.permissaoTrabalho.create({
    data: {
      empresaId: data.empresaId,
      colaboradorId: data.colaboradorId || null,
      tipo: data.tipo || "PT_GERAL",
      status: "EMITIDO",
      numero: data.numero || null,
      local: data.local.trim(),
      atividade: data.atividade.trim(),
      dataInicio: new Date(data.dataInicio),
      dataFim: data.dataFim ? new Date(data.dataFim) : null,
      riscos: data.riscos || null,
      epiNecessario: data.epiNecessario || null,
      medidasControle: data.medidasControle || null,
      observacoes: data.observacoes || null,
      autorizadoPor: data.autorizadoPor || null,
      executanteNome: data.executanteNome || null,
    },
  });
  revalidatePath("/pt");
  return { success: true, id: pt.id };
}

// ——— PET (NR-33) ———

export type PetForm = {
  empresaId: string;
  colaboradorId?: string;
  numero?: string;
  identificacaoEspaco: string;
  local: string;
  atividade: string;
  dataEntrada: string;
  dataSaidaPrevista?: string;
  atmosfera?: string;
  oxigenioPercentual?: string;
  gasesMedidos?: string;
  ventilacao?: string;
  epiEpc?: string;
  riscosAdicionais?: string;
  procedimentosEntrada?: string;
  procedimentosEmergencia?: string;
  supervisorNome?: string;
  vigiaNome?: string;
  trabalhadoresNomes?: string;
  observacoes?: string;
};

export async function listPETs(empresaId?: string) {
  const user = await requireUser();
  const scoped = empresaIdFilter(user);
  const filter = scoped || empresaId;
  return prisma.pET.findMany({
    where: filter ? { empresaId: filter } : {},
    orderBy: { dataEntrada: "desc" },
    include: {
      empresa: { select: { razaoSocial: true, nomeFantasia: true } },
      colaborador: { select: { id: true, nome: true } },
    },
  });
}

export async function getPET(id: string) {
  const user = await requireUser();
  const pet = await prisma.pET.findUnique({
    where: { id },
    include: { empresa: true, colaborador: true },
  });
  if (!pet) return null;
  assertEmpresaAccess(user, pet.empresaId);
  return pet;
}

export async function createPET(data: PetForm) {
  const user = await requireUser();
  assertEmpresaAccess(user, data.empresaId);
  if (!data.identificacaoEspaco?.trim() || !data.atividade?.trim()) {
    return { error: "Identificação do espaço e atividade são obrigatórios." };
  }
  const pet = await prisma.pET.create({
    data: {
      empresaId: data.empresaId,
      colaboradorId: data.colaboradorId || null,
      status: "EMITIDO",
      numero: data.numero || null,
      identificacaoEspaco: data.identificacaoEspaco.trim(),
      local: data.local.trim(),
      atividade: data.atividade.trim(),
      dataEntrada: new Date(data.dataEntrada),
      dataSaidaPrevista: data.dataSaidaPrevista ? new Date(data.dataSaidaPrevista) : null,
      atmosfera: data.atmosfera || null,
      oxigenioPercentual: data.oxigenioPercentual || null,
      gasesMedidos: data.gasesMedidos || null,
      ventilacao: data.ventilacao || null,
      epiEpc: data.epiEpc || null,
      riscosAdicionais: data.riscosAdicionais || null,
      procedimentosEntrada: data.procedimentosEntrada || null,
      procedimentosEmergencia: data.procedimentosEmergencia || null,
      supervisorNome: data.supervisorNome || null,
      vigiaNome: data.vigiaNome || null,
      trabalhadoresNomes: data.trabalhadoresNomes || null,
      observacoes: data.observacoes || null,
    },
  });
  revalidatePath("/pet");
  return { success: true, id: pet.id };
}

// ——— PPP ———

export type PppForm = {
  empresaId: string;
  colaboradorId: string;
  nit?: string;
  ctpsNumero?: string;
  ctpsSerie?: string;
  dataAdmissao?: string;
  dataDemissao?: string;
  lotacao?: string;
  descricaoAtividades?: string;
  fatoresRisco?: string;
  profissionalResponsavel?: string;
  registroProfissional?: string;
  observacoes?: string;
};

export async function listPPPs(empresaId?: string) {
  const user = await requireUser();
  const scoped = empresaIdFilter(user);
  const filter = scoped || empresaId;
  return prisma.pPP.findMany({
    where: filter ? { empresaId: filter } : {},
    orderBy: { updatedAt: "desc" },
    include: {
      empresa: { select: { razaoSocial: true, nomeFantasia: true } },
      colaborador: { select: { id: true, nome: true, cpf: true } },
      _count: { select: { periodos: true } },
    },
  });
}

export async function getPPP(id: string) {
  const user = await requireUser();
  const ppp = await prisma.pPP.findUnique({
    where: { id },
    include: {
      empresa: true,
      colaborador: { include: { funcao: true, setor: true } },
      periodos: { orderBy: { dataInicio: "asc" } },
    },
  });
  if (!ppp) return null;
  assertEmpresaAccess(user, ppp.empresaId);
  return ppp;
}

export async function createPPP(data: PppForm) {
  const user = await requireUser();
  assertEmpresaAccess(user, data.empresaId);

  const ppp = await prisma.pPP.create({
    data: {
      empresaId: data.empresaId,
      colaboradorId: data.colaboradorId,
      status: "RASCUNHO",
      nit: data.nit || null,
      ctpsNumero: data.ctpsNumero || null,
      ctpsSerie: data.ctpsSerie || null,
      dataAdmissao: data.dataAdmissao ? new Date(data.dataAdmissao) : null,
      dataDemissao: data.dataDemissao ? new Date(data.dataDemissao) : null,
      lotacao: data.lotacao || null,
      descricaoAtividades: data.descricaoAtividades || null,
      fatoresRisco: data.fatoresRisco || null,
      profissionalResponsavel: data.profissionalResponsavel || null,
      registroProfissional: data.registroProfissional || null,
      observacoes: data.observacoes || null,
    },
  });
  revalidatePath("/ppp");
  return { success: true, id: ppp.id };
}

export async function addPPPPeriodo(
  pppId: string,
  data: {
    dataInicio: string;
    dataFim?: string;
    cargoFuncao?: string;
    setor?: string;
    fatoresRisco?: string;
    intensidade?: string;
    tecnicaUtilizada?: string;
    epcEficaz?: boolean;
    epiEficaz?: boolean;
    observacoes?: string;
  }
) {
  const user = await requireUser();
  const ppp = await prisma.pPP.findUnique({ where: { id: pppId } });
  if (!ppp) return { error: "PPP não encontrado." };
  assertEmpresaAccess(user, ppp.empresaId);

  await prisma.pPPPeriodo.create({
    data: {
      pppId,
      dataInicio: new Date(data.dataInicio),
      dataFim: data.dataFim ? new Date(data.dataFim) : null,
      cargoFuncao: data.cargoFuncao || null,
      setor: data.setor || null,
      fatoresRisco: data.fatoresRisco || null,
      intensidade: data.intensidade || null,
      tecnicaUtilizada: data.tecnicaUtilizada || null,
      epcEficaz: data.epcEficaz ?? null,
      epiEficaz: data.epiEficaz ?? null,
      observacoes: data.observacoes || null,
    },
  });
  revalidatePath(`/ppp/${pppId}`);
  return { success: true };
}
