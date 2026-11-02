/** Consultas públicas BR: CEP e CNPJ com múltiplas fontes (fallback paralelo) */

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

/** Validação dos dígitos verificadores do CNPJ */
export function isValidCNPJ(cnpj: string): boolean {
  const d = onlyDigits(cnpj);
  if (d.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(d)) return false;

  const calc = (base: string, factors: number[]) => {
    let sum = 0;
    for (let i = 0; i < factors.length; i++) sum += parseInt(base[i], 10) * factors[i];
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const f1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const f2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d1 = calc(d, f1);
  const d2 = calc(d, f2);
  return d1 === parseInt(d[12], 10) && d2 === parseInt(d[13], 10);
}

/** Estimativa de Grau de Risco (NR-4) pela divisão do CNAE */
export function grauRiscoPorCNAE(cnae: string): number | undefined {
  const d = onlyDigits(cnae);
  if (d.length < 2) return undefined;
  const div = parseInt(d.slice(0, 2), 10);

  if (div >= 1 && div <= 3) return 3;
  if (div >= 5 && div <= 9) return 4;
  if (div >= 10 && div <= 33) {
    if ([10, 11, 13, 14, 15, 16, 17, 18, 31, 32].includes(div)) return 3;
    return 4;
  }
  if (div >= 35 && div <= 39) return 3;
  if (div >= 41 && div <= 43) return 4;
  if (div >= 45 && div <= 47) return 2;
  if (div >= 49 && div <= 53) return 3;
  if (div >= 55 && div <= 56) return 2;
  if (div >= 58 && div <= 63) return 2;
  if (div >= 64 && div <= 75) return 1;
  if (div >= 77 && div <= 82) return 2;
  if (div === 84) return 1;
  if (div === 85) return 2;
  if (div === 86 || div === 87) return 3;
  if (div >= 90 && div <= 93) return 2;
  if (div >= 94 && div <= 96) return 2;
  return 2;
}

async function fetchJson(url: string, timeoutMs = 10000): Promise<any | null> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        Accept: "application/json",
        // UA de navegador — alguns provedores bloqueiam bots/UA custom
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      cache: "no-store",
      next: { revalidate: 0 },
    } as RequestInit);
    clearTimeout(timer);
    if (!res.ok) return null;
    const text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

export type CepResult = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  fonte?: string;
};

function normalizeCepResult(raw: any, fonte: string): CepResult | null {
  if (!raw || raw.erro === true) return null;

  if (raw.logradouro != null || raw.localidade != null) {
    return {
      cep: formatCEP(String(raw.cep || "")),
      logradouro: raw.logradouro || "",
      complemento: raw.complemento || "",
      bairro: raw.bairro || "",
      localidade: raw.localidade || raw.city || "",
      uf: raw.uf || raw.state || "",
      fonte,
    };
  }

  if (raw.street != null || raw.city != null) {
    return {
      cep: formatCEP(String(raw.cep || "")),
      logradouro: raw.street || "",
      complemento: "",
      bairro: raw.neighborhood || raw.bairro || "",
      localidade: raw.city || "",
      uf: raw.state || "",
      fonte,
    };
  }

  if (raw.address != null && (raw.city || raw.state)) {
    return {
      cep: formatCEP(String(raw.cep || "")),
      logradouro: raw.address || raw.logradouro || "",
      complemento: "",
      bairro: raw.district || raw.bairro || "",
      localidade: raw.city || "",
      uf: raw.state || "",
      fonte,
    };
  }

  if (raw.address_name != null || (raw.address && raw.city)) {
    return {
      cep: formatCEP(String(raw.cep || "")),
      logradouro: raw.address || `${raw.address_type || ""} ${raw.address_name || ""}`.trim(),
      complemento: "",
      bairro: raw.district || "",
      localidade: raw.city || "",
      uf: raw.state || "",
      fonte,
    };
  }

  return null;
}

/** CEP: várias fontes em sequência rápida */
export async function buscarCEP(cep: string): Promise<CepResult | { error: string }> {
  const d = onlyDigits(cep);
  if (d.length !== 8) return { error: "CEP deve ter 8 dígitos." };

  const fontes: { url: string; nome: string }[] = [
    { url: `https://viacep.com.br/ws/${d}/json/`, nome: "ViaCEP" },
    { url: `https://brasilapi.com.br/api/cep/v2/${d}`, nome: "BrasilAPI" },
    { url: `https://brasilapi.com.br/api/cep/v1/${d}`, nome: "BrasilAPI-v1" },
    { url: `https://opencep.com/v1/${d}`, nome: "OpenCEP" },
    { url: `https://cep.awesomeapi.com.br/json/${d}`, nome: "AwesomeAPI" },
  ];

  // paralelo — primeira resposta válida
  const settled = await Promise.allSettled(
    fontes.map(async (f) => {
      const data = await fetchJson(f.url, 8000);
      const norm = normalizeCepResult(data, f.nome);
      if (norm && (norm.localidade || norm.logradouro)) return norm;
      throw new Error("empty");
    })
  );

  for (const s of settled) {
    if (s.status === "fulfilled") return s.value;
  }

  return { error: "CEP não encontrado em nenhuma fonte pública." };
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
  fonte?: string;
};

function buildEndereco(parts: {
  tipo?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
}) {
  const rua = [parts.tipo, parts.logradouro].filter(Boolean).join(" ").trim();
  const num = parts.numero ? `, ${parts.numero}` : "";
  const comp = parts.complemento ? ` - ${parts.complemento}` : "";
  const bairro = parts.bairro ? ` - ${parts.bairro}` : "";
  return `${rua}${num}${comp}${bairro}`.trim();
}

function fromBrasilApiLike(data: any, d: string, fonte: string): CnpjResult | null {
  if (!data || (!data.razao_social && !data.nome_fantasia && !data.nome)) return null;
  const cnaeCode = data.cnae_fiscal
    ? String(data.cnae_fiscal)
    : onlyDigits(String(data.atividade_principal?.[0]?.code || ""));
  return {
    cnpj: formatCNPJMask(d),
    razaoSocial: data.razao_social || data.nome || data.nome_fantasia || "",
    nomeFantasia: data.nome_fantasia || data.fantasia || "",
    cnae: cnaeCode,
    cnaeDescricao: data.cnae_fiscal_descricao || data.atividade_principal?.[0]?.text || "",
    grauRisco: grauRiscoPorCNAE(cnaeCode),
    endereco: buildEndereco({
      tipo: data.descricao_tipo_de_logradouro,
      logradouro: data.logradouro,
      numero: data.numero,
      complemento: data.complemento,
      bairro: data.bairro,
    }),
    cidade: data.municipio || "",
    uf: data.uf || "",
    cep: data.cep ? formatCEP(String(data.cep)) : "",
    telefone: data.ddd_telefone_1
      ? String(data.ddd_telefone_1)
      : data.telefone
        ? String(data.telefone)
        : "",
    email: data.email || "",
    situacao: data.descricao_situacao_cadastral || data.situacao || "",
    fonte,
  };
}

function fromReceitaWs(data: any, d: string): CnpjResult | null {
  if (!data || data.status === "ERROR" || (!data.nome && !data.fantasia)) return null;
  const cnaeCode = onlyDigits(String(data.atividade_principal?.[0]?.code || ""));
  return {
    cnpj: formatCNPJMask(d),
    razaoSocial: data.nome || "",
    nomeFantasia: data.fantasia || "",
    cnae: cnaeCode,
    cnaeDescricao: data.atividade_principal?.[0]?.text || "",
    grauRisco: grauRiscoPorCNAE(cnaeCode),
    endereco: buildEndereco({
      logradouro: data.logradouro,
      numero: data.numero,
      complemento: data.complemento,
      bairro: data.bairro,
    }),
    cidade: data.municipio || "",
    uf: data.uf || "",
    cep: data.cep ? formatCEP(String(data.cep)) : "",
    telefone: data.telefone || "",
    email: data.email || "",
    situacao: data.situacao || "",
    fonte: "ReceitaWS",
  };
}

function fromOpenCnpj(data: any, d: string): CnpjResult | null {
  const body = data?.data || data;
  if (!body || (!body.razaoSocial && !body.razao_social && !body.nome)) return null;
  const cnaeCode = onlyDigits(
    String(
      body.cnaePrincipal ||
        body.cnae ||
        body.cnae_fiscal ||
        body.atividadePrincipal?.codigo ||
        body.atividade_principal?.[0]?.code ||
        ""
    )
  );
  return {
    cnpj: formatCNPJMask(d),
    razaoSocial: body.razaoSocial || body.razao_social || body.nome || "",
    nomeFantasia: body.nomeFantasia || body.nome_fantasia || body.fantasia || "",
    cnae: cnaeCode,
    cnaeDescricao: body.cnaeDescricao || body.cnae_fiscal_descricao || "",
    grauRisco: grauRiscoPorCNAE(cnaeCode),
    endereco: buildEndereco({
      logradouro: body.logradouro,
      numero: body.numero,
      complemento: body.complemento,
      bairro: body.bairro,
    }),
    cidade: body.municipio || body.cidade || "",
    uf: body.uf || "",
    cep: body.cep ? formatCEP(String(body.cep)) : "",
    telefone: body.telefone || "",
    email: body.email || "",
    situacao: body.situacaoCadastral || body.situacao || "",
    fonte: "OpenCNPJ",
  };
}

function fromCnpja(data: any, d: string): CnpjResult | null {
  if (!data || (!data.company?.name && !data.alias && !data.taxId)) return null;
  const cnaeCode = onlyDigits(String(data.mainActivity?.id || ""));
  const addr = data.address || {};
  return {
    cnpj: formatCNPJMask(d),
    razaoSocial: data.company?.name || data.alias || "",
    nomeFantasia: data.alias || "",
    cnae: cnaeCode,
    cnaeDescricao: data.mainActivity?.text || "",
    grauRisco: grauRiscoPorCNAE(cnaeCode),
    endereco: buildEndereco({
      logradouro: addr.street,
      numero: addr.number,
      complemento: addr.details,
      bairro: addr.district,
    }),
    cidade: addr.city || "",
    uf: addr.state || "",
    cep: addr.zip ? formatCEP(String(addr.zip)) : "",
    telefone: data.phones?.[0] ? `${data.phones[0].area || ""}${data.phones[0].number || ""}` : "",
    email: data.emails?.[0]?.address || "",
    situacao: data.status?.text || "",
    fonte: "CNPJá",
  };
}

function fromPublicaCnpj(data: any, d: string): CnpjResult | null {
  if (!data || (!data.razao_social && !data.estabelecimento)) return null;
  const est = data.estabelecimento || {};
  const ativ = est.atividade_principal || {};
  const cnaeCode = onlyDigits(String(ativ.subclasse || ativ.id || ""));
  return {
    cnpj: formatCNPJMask(d),
    razaoSocial: data.razao_social || "",
    nomeFantasia: est.nome_fantasia || "",
    cnae: cnaeCode,
    cnaeDescricao: ativ.descricao || "",
    grauRisco: grauRiscoPorCNAE(cnaeCode),
    endereco: buildEndereco({
      tipo: est.tipo_logradouro,
      logradouro: est.logradouro,
      numero: est.numero,
      complemento: est.complemento,
      bairro: est.bairro,
    }),
    cidade: est.cidade?.nome || est.municipio || "",
    uf: est.estado?.sigla || est.uf || "",
    cep: est.cep ? formatCEP(String(est.cep)) : "",
    telefone: est.ddd1 && est.telefone1 ? `${est.ddd1}${est.telefone1}` : "",
    email: est.email || "",
    situacao: est.situacao_cadastral || "",
    fonte: "Pública CNPJ",
  };
}

/**
 * CNPJ — consulta em paralelo nas fontes públicas gratuitas.
 * A primeira resposta válida é usada (mais rápido e resiliente no Vercel).
 */
export async function buscarCNPJ(cnpj: string): Promise<CnpjResult | { error: string }> {
  const d = onlyDigits(cnpj);
  if (d.length !== 14) return { error: "CNPJ deve ter 14 dígitos." };
  if (!isValidCNPJ(d)) return { error: "CNPJ inválido (dígitos verificadores)." };

  const jobs: Promise<CnpjResult | null>[] = [
    fetchJson(`https://brasilapi.com.br/api/cnpj/v1/${d}`, 12000).then((data) =>
      fromBrasilApiLike(data, d, "BrasilAPI")
    ),
    // MinhaReceita usa o mesmo formato da BrasilAPI
    fetchJson(`https://minhareceita.org/${d}`, 12000).then((data) =>
      fromBrasilApiLike(data, d, "MinhaReceita")
    ),
    fetchJson(`https://www.receitaws.com.br/v1/cnpj/${d}`, 12000).then((data) =>
      fromReceitaWs(data, d)
    ),
    fetchJson(`https://kitana.opencnpj.com/cnpj/${d}`, 12000).then((data) => fromOpenCnpj(data, d)),
    fetchJson(`https://open.cnpja.com/office/${d}`, 12000).then((data) => fromCnpja(data, d)),
    fetchJson(`https://publica.cnpj.ws/cnpj/${d}`, 12000).then((data) => fromPublicaCnpj(data, d)),
  ];

  const settled = await Promise.allSettled(jobs);

  for (const s of settled) {
    if (s.status === "fulfilled" && s.value?.razaoSocial) {
      return s.value;
    }
  }

  return {
    error:
      "Não foi possível consultar o CNPJ agora (fontes públicas indisponíveis ou limite de uso). Verifique o número e tente de novo em alguns segundos, ou preencha manualmente.",
  };
}
