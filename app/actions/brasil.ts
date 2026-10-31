"use server";

import { buscarCEP, buscarCNPJ, isValidCPF, onlyDigits, formatCPFMask } from "@/lib/brasil";
import { prisma } from "@/lib/prisma";

export async function actionBuscarCEP(cep: string) {
  return buscarCEP(cep);
}

export async function actionBuscarCNPJ(cnpj: string) {
  return buscarCNPJ(cnpj);
}

export async function actionValidarCPF(cpf: string) {
  const d = onlyDigits(cpf);
  if (d.length !== 11) return { valid: false, message: "CPF deve ter 11 dígitos." };
  if (!isValidCPF(d)) return { valid: false, message: "CPF inválido." };
  return { valid: true, message: "CPF válido." };
}

export type CpfLookupResult = {
  cpf: string;
  nome?: string;
  dataNascimento?: string;
  sexo?: string;
  email?: string;
  telefone?: string;
  regiaoEmissao?: string;
  ufs?: string[];
  fonte: "interno" | "brasilapi" | "api" | "validacao";
  message: string;
};

/**
 * Busca CPF:
 * 1) Valida dígitos
 * 2) Base interna SGS (preenche nome se já cadastrado)
 * 3) BrasilAPI — validação + região de emissão (não retorna nome)
 * 4) API externa opcional (CPF_API_URL + CPF_API_TOKEN) para nome
 */
export async function actionBuscarCPF(cpf: string): Promise<CpfLookupResult | { error: string }> {
  const d = onlyDigits(cpf);
  if (d.length !== 11) return { error: "CPF deve ter 11 dígitos." };
  if (!isValidCPF(d)) return { error: "CPF inválido." };

  // 1) Base interna
  try {
    const interno = await prisma.colaborador.findFirst({
      where: { cpf: d, ativo: true },
      orderBy: { updatedAt: "desc" },
    });

    if (interno) {
      return {
        cpf: formatCPFMask(d),
        nome: interno.nome,
        dataNascimento: interno.dataNascimento
          ? new Date(interno.dataNascimento).toISOString().slice(0, 10)
          : undefined,
        sexo: interno.sexo || undefined,
        email: interno.email || undefined,
        telefone: interno.telefone || undefined,
        fonte: "interno",
        message: "Dados encontrados na base do SGS.",
      };
    }
  } catch {
    // banco indisponível
  }

  // 2) BrasilAPI — validação + região (não tem nome/nascimento)
  let regiaoEmissao: string | undefined;
  let ufs: string[] | undefined;
  let brasilOk = false;

  try {
    const res = await fetch(`https://brasilapi.com.br/api/cpf/v1/${d}`, {
      next: { revalidate: 86400 },
    });

    if (res.ok) {
      const data = await res.json();
      brasilOk = data.isValid === true;
      if (data.rf != null) regiaoEmissao = String(data.rf);
      if (Array.isArray(data.ufs)) ufs = data.ufs.map(String);

      if (data.isValid === false) {
        return { error: "CPF inválido (BrasilAPI)." };
      }
    }
  } catch {
    // segue
  }

  // 3) API externa opcional com nome
  const apiUrl = process.env.CPF_API_URL;
  const apiToken = process.env.CPF_API_TOKEN;

  if (apiUrl && apiToken) {
    try {
      const url = apiUrl.includes("{cpf}")
        ? apiUrl.replace("{cpf}", d)
        : `${apiUrl.replace(/\/$/, "")}/${d}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        const nome =
          data.nome || data.name || data.nome_completo || data.nomeCompleto || data?.data?.NOME || "";
        const nasc =
          data.data_nascimento ||
          data.dataNascimento ||
          data.birthDate ||
          data.nascimento ||
          data?.data?.NASC ||
          "";

        if (nome) {
          return {
            cpf: formatCPFMask(d),
            nome: String(nome),
            dataNascimento: nasc ? String(nasc).slice(0, 10) : undefined,
            sexo: data.sexo || data.genero || data?.data?.SEXO || undefined,
            email: data.email || undefined,
            telefone: data.telefone || data.phone || undefined,
            regiaoEmissao,
            ufs,
            fonte: "api",
            message: "Dados encontrados via API de CPF.",
          };
        }
      }
    } catch {
      // falha na API paga
    }
  }

  const ufsTxt = ufs?.length ? ` · UF(s): ${ufs.join(", ")}` : "";
  const rfTxt = regiaoEmissao != null ? ` · Região RF: ${regiaoEmissao}` : "";

  return {
    cpf: formatCPFMask(d),
    regiaoEmissao,
    ufs,
    fonte: brasilOk ? "brasilapi" : "validacao",
    message: brasilOk
      ? `CPF válido (BrasilAPI)${rfTxt}${ufsTxt}. Nome não é fornecido pela BrasilAPI — preencha manualmente.`
      : "CPF válido. Nome não disponível em API pública gratuita (LGPD). Preencha o nome manualmente.",
  };
}
