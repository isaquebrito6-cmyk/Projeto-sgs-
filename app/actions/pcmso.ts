"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, assertEmpresaAccess, empresaIdFilter } from "@/lib/tenant";
import { labelGrauRisco } from "@/lib/pgr-nr1";

export type PCMSOFormData = {
  titulo: string;
  empresaId: string;
  pgrId?: string;
  versao?: string;
  medicoCoordenadorId?: string;
  responsavelNome?: string;
  responsavelCrm?: string;
  objetivos?: string;
  diretrizes?: string;
};

export type ExamePCMSOData = {
  nomeExame: string;
  tipo: string;
  periodicidade?: string;
  setoresAplicaveis?: string;
  funcoesAplicaveis?: string;
  observacoes?: string;
};

function montarObjetivosPadrao(emp: {
  razaoSocial: string;
  grauRisco: number | null;
  cnae: string | null;
}) {
  return [
    `Promover e preservar a saúde do conjunto dos trabalhadores da organização ${emp.razaoSocial}, em conformidade com a NR-7.`,
    `Rastrear e diagnosticar precocemente os agravos à saúde relacionados ao trabalho, considerando o grau de risco ${labelGrauRisco(emp.grauRisco)}${emp.cnae ? ` e o CNAE ${emp.cnae}` : ""}.`,
    "Definir a realização dos exames médicos ocupacionais (admissional, periódico, de retorno ao trabalho, de mudança de riscos ocupacionais e demissional).",
    "Integrar as ações do PCMSO ao Programa de Gerenciamento de Riscos (PGR / NR-1), utilizando o inventário de riscos como base para a definição dos exames.",
  ].join("\n");
}

function montarDiretrizesPadrao() {
  return [
    "O PCMSO é parte integrante do conjunto de iniciativas da organização no campo da saúde dos trabalhadores, articulando-se com o PGR.",
    "Os exames médicos compreendem avaliação clínica (anamnese ocupacional e exame físico) e exames complementares conforme os riscos do inventário.",
    "Todo exame deve gerar ASO com o conteúdo mínimo da NR-7 (item 7.5.19.1).",
    "O médico coordenador poderá indicar exames complementares além do quadro básico, conforme critérios clínicos e epidemiológicos.",
    "Os dados de saúde dos trabalhadores são de acesso restrito e devem ser tratados com confidencialidade.",
  ].join("\n");
}

export async function listPCMSOs(empresaId?: string) {
  const user = await requireUser();
  const scoped = empresaIdFilter(user);
  const filter = scoped || empresaId;

  return prisma.pCMSO.findMany({
    where: filter ? { empresaId: filter } : undefined,
    orderBy: { dataElaboracao: "desc" },
    include: {
      empresa: { select: { id: true, razaoSocial: true, nomeFantasia: true } },
      pgr: { select: { id: true, titulo: true } },
      medicoCoordenador: { select: { id: true, nome: true, crm: true, crmUf: true } },
      _count: { select: { exames: true } },
    },
  });
}

export async function getPCMSO(id: string) {
  const user = await requireUser();

  const pcmso = await prisma.pCMSO.findUnique({
    where: { id },
    include: {
      empresa: true,
      pgr: { include: { inventarioItens: { include: { risco: true } } } },
      medicoCoordenador: true,
      exames: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!pcmso) return null;
  assertEmpresaAccess(user, pcmso.empresaId);
  return pcmso;
}

export async function createPCMSO(data: PCMSOFormData) {
  const user = await requireUser();
  assertEmpresaAccess(user, data.empresaId);

  const emp = await prisma.empresa.findUnique({ where: { id: data.empresaId } });
  if (!emp) return { error: "Empresa não encontrada." };

  const titulo =
    data.titulo.trim() ||
    `PCMSO — ${emp.nomeFantasia || emp.razaoSocial}`;

  const objetivos =
    data.objetivos?.trim() || montarObjetivosPadrao(emp);
  const diretrizes =
    data.diretrizes?.trim() || montarDiretrizesPadrao();

  const pcmso = await prisma.pCMSO.create({
    data: {
      titulo,
      empresaId: data.empresaId,
      pgrId: data.pgrId || null,
      versao: data.versao || "1.0",
      medicoCoordenadorId: data.medicoCoordenadorId || null,
      responsavelNome: data.responsavelNome?.trim() || null,
      responsavelCrm: data.responsavelCrm?.trim() || null,
      objetivos,
      diretrizes,
      status: "RASCUNHO",
    },
  });

  if (data.pgrId) {
    const pgr = await prisma.pGR.findUnique({
      where: { id: data.pgrId },
      include: { inventarioItens: { include: { risco: true } } },
    });

    if (pgr) {
      const examesPadrao: {
        nomeExame: string;
        tipo: string;
        periodicidade: string;
        setoresAplicaveis?: string;
        funcoesAplicaveis?: string;
      }[] = [
        { nomeExame: "Exame Clínico Ocupacional", tipo: "Admissional", periodicidade: "—" },
        {
          nomeExame: "Exame Clínico Ocupacional",
          tipo: "Periódico",
          periodicidade: emp.grauRisco && emp.grauRisco >= 3 ? "Anual" : "Bienal",
        },
        { nomeExame: "Exame Clínico Ocupacional", tipo: "Demissional", periodicidade: "—" },
        { nomeExame: "Exame Clínico Ocupacional", tipo: "Retorno ao Trabalho", periodicidade: "—" },
        {
          nomeExame: "Exame Clínico Ocupacional",
          tipo: "Mudança de Riscos Ocupacionais",
          periodicidade: "—",
        },
      ];

      const tipos = new Set(pgr.inventarioItens.map((i) => i.risco.tipo));
      const setoresComRisco = [
        ...new Set(pgr.inventarioItens.map((i) => i.setorNome).filter(Boolean)),
      ] as string[];
      const setoresLabel = setoresComRisco.join("; ") || undefined;

      if (tipos.has("FISICO")) {
        examesPadrao.push({
          nomeExame: "Audiometria",
          tipo: "Periódico",
          periodicidade: "Anual",
          setoresAplicaveis: setoresLabel,
        });
      }
      if (tipos.has("QUIMICO") || tipos.has("BIOLOGICO")) {
        examesPadrao.push({
          nomeExame: "Espirometria",
          tipo: "Periódico",
          periodicidade: "Anual",
          setoresAplicaveis: setoresLabel,
        });
        examesPadrao.push({
          nomeExame: "Hemograma completo",
          tipo: "Periódico",
          periodicidade: "Anual",
          setoresAplicaveis: setoresLabel,
        });
      }
      if (tipos.has("ERGONOMICO") || tipos.has("PSICOSSOCIAL")) {
        examesPadrao.push({
          nomeExame: "Avaliação clínica com ênfase ergonômica / psicossocial",
          tipo: "Periódico",
          periodicidade: "Anual",
          setoresAplicaveis: setoresLabel,
        });
      }

      for (const ex of examesPadrao) {
        await prisma.examePCMSO.create({
          data: {
            pcmsoId: pcmso.id,
            nomeExame: ex.nomeExame,
            tipo: ex.tipo,
            periodicidade: ex.periodicidade,
            setoresAplicaveis: ex.setoresAplicaveis || null,
            funcoesAplicaveis: ex.funcoesAplicaveis || null,
          },
        });
      }
    }
  } else {
    // Sem PGR: quadro clínico mínimo NR-7
    for (const ex of [
      { nomeExame: "Exame Clínico Ocupacional", tipo: "Admissional", periodicidade: "—" },
      {
        nomeExame: "Exame Clínico Ocupacional",
        tipo: "Periódico",
        periodicidade: emp.grauRisco && emp.grauRisco >= 3 ? "Anual" : "Bienal",
      },
      { nomeExame: "Exame Clínico Ocupacional", tipo: "Demissional", periodicidade: "—" },
    ]) {
      await prisma.examePCMSO.create({ data: { pcmsoId: pcmso.id, ...ex } });
    }
  }

  revalidatePath("/pcmso");
  revalidatePath("/pgr");
  return { success: true, id: pcmso.id };
}

export async function addExamePCMSO(pcmsoId: string, data: ExamePCMSOData) {
  const user = await requireUser();
  const pcmso = await prisma.pCMSO.findUnique({ where: { id: pcmsoId } });
  if (!pcmso) return { error: "PCMSO não encontrado." };
  assertEmpresaAccess(user, pcmso.empresaId);

  await prisma.examePCMSO.create({
    data: {
      pcmsoId,
      nomeExame: data.nomeExame.trim(),
      tipo: data.tipo,
      periodicidade: data.periodicidade || null,
      setoresAplicaveis: data.setoresAplicaveis || null,
      funcoesAplicaveis: data.funcoesAplicaveis || null,
      observacoes: data.observacoes || null,
    },
  });

  revalidatePath(`/pcmso/${pcmsoId}`);
  return { success: true };
}

export async function removeExamePCMSO(id: string, pcmsoId: string) {
  const user = await requireUser();
  const pcmso = await prisma.pCMSO.findUnique({ where: { id: pcmsoId } });
  if (!pcmso) return { error: "PCMSO não encontrado." };
  assertEmpresaAccess(user, pcmso.empresaId);

  await prisma.examePCMSO.delete({ where: { id } });
  revalidatePath(`/pcmso/${pcmsoId}`);
  return { success: true };
}
