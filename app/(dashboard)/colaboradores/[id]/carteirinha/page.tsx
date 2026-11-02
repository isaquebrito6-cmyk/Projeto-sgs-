import { notFound } from "next/navigation";
import { getColaborador } from "@/app/actions/colaboradores";
import { CarteirinhaView } from "@/components/carteirinha-view";
import { formatCPF, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CarteirinhaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await getColaborador(id);
  if (!c) notFound();

  return (
    <CarteirinhaView
      data={{
        id: c.id,
        nome: c.nome,
        cpfFormatado: formatCPF(c.cpf),
        fotoUrl: c.fotoUrl,
        empresa: c.empresa.nomeFantasia || c.empresa.razaoSocial,
        funcao: c.funcao?.nome || null,
        setor: c.setor?.nome || null,
        admissao: c.dataAdmissao ? formatDate(c.dataAdmissao) : null,
      }}
    />
  );
}
