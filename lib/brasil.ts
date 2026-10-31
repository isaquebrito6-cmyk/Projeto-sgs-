/** Consultas públicas BR: CEP (ViaCEP), CNPJ (BrasilAPI) e validação de CPF */

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatCEP(cep: string) {
  const d = onlyDigits(cep).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function formatCPFMask(cpf: string) {
  const d = onlyDigits(cpf).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function formatCNPJMask(cnpj: string) {
  const d = onlyDigits(cnpj).slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12)
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

/** Validação de CPF (algoritmo oficial) */
export function isValidCPF(cpf: string): boolean {
  const d = onlyDigits(cpf);
  if (d.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(d)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(d[i], 10) * (10 - i);
  let rev = (sum * 10) % 11;
  if (rev === 10) rev = 0;
  if (rev !== parseInt(d[9], 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(d[i], 10) * (11 - i);
  rev = (sum * 10) % 11;
  if (rev === 10) rev = 0;
  return rev === parseInt(d[10], 10);
}

/**
 * Estimativa de Grau de Risco (NR-4) a partir do CNAE.
 * Usa a divisão (2 primeiros dígitos) — referência prática para preenchimento automático.
 * O usuário pode ajustar manualmente.
 */
export function grauRiscoPorCNAE(cnae: string): number | undefined {
  const d = onlyDigits(cnae);
  if (d.length < 2) return undefined;
  const div = parseInt(d.slice(0, 2), 10);

  // Agricultura, pecuária
  if (div >= 1 && div <= 3) return 3;
  // Extração mineral
  if (div >= 5 && div <= 9) return 4;
  // Indústrias de transformação (varia; maioria 3-4)
  if (div >= 10 && div <= 33) {
    if ([10, 11, 13, 14, 15, 16, 17, 18, 31, 32].includes(div)) return 3;
    return 4;
  }
  // Energia, água, esgoto
  if (div >= 35 && div <= 39) return 3;
  // Construção
  if (div >= 41 && div <= 43) return 4;
  // Comércio
  if (div >= 45 && div <= 47) return 2;
  // Transporte
  if (div >= 49 && div <= 53) return 3;
  // Alojamento e alimentação
  if (div >= 55 && div <= 56) return 2;
  // Informação e comunicação
  if (div >= 58 && div <= 63) return 2;
  // Finanças, imobiliárias, profissionais
  if (div >= 64 && div <= 75) return 1;
  // Administrativas
  if (div >= 77 && div <= 82) return 2;
  // Administração pública, educação, saúde
  if (div === 84) return 1;
  if (div === 85) return 2;
  if (div === 86 || div === 87) return 3;
  // Artes, esportes
  if (div >= 90 && div <= 93) return 2;
  // Serviços pessoais
  if (div >= 94 && div <= 96) return 2;

  return 2;
}

export type CepResult = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
};

export async function buscarCEP(cep: string): Promise<CepResult | { error: string }> {
  const d = onlyDigits(cep);
  if (d.length !== 8) return { error: "CEP deve ter 8 dígitos." };

  try {
    const res = await fetch(`https://viacep.com.br/ws/${d}/json/`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return { error: "Falha ao consultar CEP." };
    const data = await res.json();
    if (data.erro) return { error: "CEP não encontrado." };

    return {
      cep: formatCEP(d),
      logradouro: data.logradouro || "",
      complemento: data.complemento || "",
      bairro: data.bairro || "",
      localidade: data.localidade || "",
      uf: data.uf || "",
    };
  } catch {
    return { error: "Erro de rede ao consultar CEP." };
  }
}

export type CnpjResult = {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnae: string;
  cnaeDescricao: string;
  grauRisco?: number;
  endereco: string;
  cidade: string;
  uf: string;
  cep: string;
  telefone: string;
  email: string;
  situacao: string;
};

export async function buscarCNPJ(cnpj: string): Promise<CnpjResult | { error: string }> {
  const d = onlyDigits(cnpj);
  if (d.length !== 14) return { error: "CNPJ deve ter 14 dígitos." };

  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${d}`, {
      next: { revalidate: 86400 },
    });

    if (res.status === 404) return { error: "CNPJ não encontrado." };
    if (!res.ok) return { error: "Falha ao consultar CNPJ. Tente novamente." };

    const data = await res.json();

    const logradouro = [data.descricao_tipo_de_logradouro, data.logradouro]
      .filter(Boolean)
      .join(" ");
    const numero = data.numero ? `, ${data.numero}` : "";
    const complemento = data.complemento ? ` - ${data.complemento}` : "";
    const bairro = data.bairro ? ` - ${data.bairro}` : "";

    const cnaeCode = data.cnae_fiscal
      ? String(data.cnae_fiscal)
      : data.cnaes_secundarios?.[0]?.codigo
        ? String(data.cnaes_secundarios[0].codigo)
        : "";

    const telefone =
      data.ddd_telefone_1 ||
      (data.ddd_fax ? data.ddd_fax : "") ||
      "";

    return {
      cnpj: formatCNPJMask(d),
      razaoSocial: data.razao_social || data.nome_fantasia || "",
      nomeFantasia: data.nome_fantasia || "",
      cnae: cnaeCode,
      cnaeDescricao: data.cnae_fiscal_descricao || "",
      grauRisco: grauRiscoPorCNAE(cnaeCode),
      endereco: `${logradouro}${numero}${complemento}${bairro}`.trim(),
      cidade: data.municipio || "",
      uf: data.uf || "",
      cep: data.cep ? formatCEP(String(data.cep)) : "",
      telefone: telefone ? String(telefone) : "",
      email: data.email || "",
      situacao: data.descricao_situacao_cadastral || "",
    };
  } catch {
    return { error: "Erro de rede ao consultar CNPJ." };
  }
}
