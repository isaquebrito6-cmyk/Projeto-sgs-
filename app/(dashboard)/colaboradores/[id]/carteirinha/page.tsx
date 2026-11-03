import { notFound } from "next/navigation";
import { getColaborador } from "@/app/actions/colaboradores";
import { CarteirinhaView } from "@/components/carteirinha-view";
import { formatCPF, formatDate } from "@/lib/utils";
import {
  listarNRsDosTreinamentos,
  listarMaquinasAptas,
  validadeAsoEstimada,
  formatDateBR,
} from "@/lib/carteirinha";

export const dynamic = "force-dynamic";

export default async function CarteirinhaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await getColaborador(id);
  if (!c) notFound();

  const treinos = (c.treinamentosParticipante || []).map((p) => ({
    titulo: p.treinamento.titulo,
    tipo: p.treinamento.tipo,
    catalogoId: p.treinamento.catalogoId,
    dataRealizacao: p.treinamento.dataRealizacao,
    validade: p.treinamento.validade,
    presente: p.presente,
  }));

  const nrs = listarNRsDosTreinamentos(treinos).map((n) => ({
    nr: n.nr,
    validadeLabel: n.validade ? formatDateBR(n.validade) : null,
    vencido: n.validade ? n.validade < new Date() : false,
  }));

  const maquinas = listarMaquinasAptas(treinos);

  const aso = c.asos?.[0];
  let asoChip: { conclusao: string; validadeLabel: string; emissaoLabel: string; vencido: boolean } | null =
    null;
  if (aso) {
    const val = validadeAsoEstimada(aso.dataEmissao, 12);
    asoChip = {
      conclusao: aso.conclusao,
      emissaoLabel: formatDateBR(aso.dataEmissao),
      validadeLabel: formatDateBR(val),
      vencido: val < new Date(),
    };
  }

  return (
    <CarteirinhaView
      data={{
        id: c.id,
        nome: c.nome,
        cpfFormatado: formatCPF(c.cpf),
        fotoUrl: c.fotoUrl,
        empresa: c.empresa.nomeFantasia || c.empresa.razaoSocial,
        cnpj: c.empresa.cnpj,
        funcao: c.funcao?.nome || null,
        setor: c.setor?.nome || null,
        admissao: c.dataAdmissao ? formatDate(c.dataAdmissao) : null,
        nrs,
        maquinas,
        aso: asoChip,
      }}
    />
  );
}
