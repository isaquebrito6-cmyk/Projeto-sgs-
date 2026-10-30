import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const empresas = await prisma.empresa.findMany({
    orderBy: { razaoSocial: "asc" },
  });

  return NextResponse.json(empresas);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (!body.razaoSocial || !body.cnpj) {
      return NextResponse.json(
        { error: "Razão Social e CNPJ são obrigatórios." },
        { status: 400 }
      );
    }

    const cnpjClean = body.cnpj.replace(/\D/g, "");

    const existing = await prisma.empresa.findUnique({
      where: { cnpj: cnpjClean },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Já existe uma empresa cadastrada com este CNPJ." },
        { status: 400 }
      );
    }

    const empresa = await prisma.empresa.create({
      data: {
        razaoSocial: body.razaoSocial,
        nomeFantasia: body.nomeFantasia || null,
        cnpj: cnpjClean,
        inscricaoEstadual: body.inscricaoEstadual || null,
        endereco: body.endereco || null,
        cidade: body.cidade || null,
        uf: body.uf || null,
        cep: body.cep || null,
        telefone: body.telefone || null,
        email: body.email || null,
        grauRisco: body.grauRisco || null,
        cnae: body.cnae || null,
        numeroFuncionarios: body.numeroFuncionarios || null,
      },
    });

    return NextResponse.json(empresa, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar empresa:", error);
    return NextResponse.json(
      { error: "Erro interno ao cadastrar empresa." },
      { status: 500 }
    );
  }
}
