"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updatePastaTreinamentos,
  upsertMaterialTreinamento,
  deleteMaterialTreinamento,
} from "@/app/actions/materiais-treinamento";
import { CATALOGO_TREINAMENTOS } from "@/lib/nr-treinamentos";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, FolderOpen, Link2, Trash2 } from "lucide-react";

type Material = {
  id: string;
  catalogoId: string;
  titulo: string;
  norma: string | null;
  url: string;
  descricao: string | null;
};

type EmpresaMat = {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  pastaTreinamentosUrl: string | null;
  materiaisTreinamento: Material[];
};

export function MateriaisTreinamentoPanel({ empresas }: { empresas: EmpresaMat[] }) {
  const router = useRouter();
  const [empresaId, setEmpresaId] = useState(empresas[0]?.id || "");
  const empresa = empresas.find((e) => e.id === empresaId) || empresas[0];
  const [pasta, setPasta] = useState(empresa?.pastaTreinamentosUrl || "");
  const [catalogoId, setCatalogoId] = useState(CATALOGO_TREINAMENTOS[0]?.id || "");
  const [urlMaterial, setUrlMaterial] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  function onChangeEmpresa(id: string) {
    setEmpresaId(id);
    const e = empresas.find((x) => x.id === id);
    setPasta(e?.pastaTreinamentosUrl || "");
    setMsg("");
    setErr("");
  }

  async function salvarPasta() {
    if (!empresaId) return;
    setLoading(true);
    setErr("");
    setMsg("");
    const res = await updatePastaTreinamentos(empresaId, pasta);
    setLoading(false);
    if (res.error) setErr(res.error);
    else {
      setMsg("Pasta salva.");
      router.refresh();
    }
  }

  async function salvarMaterial() {
    if (!empresaId || !catalogoId || !urlMaterial.trim()) {
      setErr("Selecione o tipo de treinamento e informe a URL.");
      return;
    }
    setLoading(true);
    setErr("");
    setMsg("");
    const res = await upsertMaterialTreinamento({
      empresaId,
      catalogoId,
      url: urlMaterial,
    });
    setLoading(false);
    if (res.error) setErr(res.error);
    else {
      setMsg("Material vinculado.");
      setUrlMaterial("");
      router.refresh();
    }
  }

  async function remover(id: string) {
    setLoading(true);
    await deleteMaterialTreinamento(id);
    setLoading(false);
    router.refresh();
  }

  if (!empresas.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-slate-500 text-sm">
          Cadastre uma empresa antes de configurar pastas de materiais.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Pasta geral na nuvem
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Como o SGS roda na internet (Vercel), ele <strong>não acessa pasta do seu computador</strong>.
            Use uma pasta compartilhada no <strong>Google Drive</strong>, <strong>OneDrive</strong> ou{" "}
            <strong>Dropbox</strong> e cole o link abaixo.
          </p>

          <div className="space-y-2">
            <label className="text-sm font-medium">Empresa</label>
            <select
              value={empresaId}
              onChange={(e) => onChangeEmpresa(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nomeFantasia || e.razaoSocial}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Link da pasta de treinamentos</label>
            <input
              value={pasta}
              onChange={(e) => setPasta(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <p className="text-xs text-slate-500">
              No Drive: abra a pasta → Compartilhar → qualquer pessoa com o link → copiar link.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className="bg-sgs-700 hover:bg-sgs-800"
              disabled={loading}
              onClick={salvarPasta}
            >
              Salvar pasta
            </Button>
            {pasta.trim() && (
              <a href={pasta.trim()} target="_blank" rel="noopener noreferrer">
                <Button type="button" variant="outline">
                  <ExternalLink className="w-4 h-4" />
                  Abrir pasta
                </Button>
              </a>
            )}
          </div>

          {msg && <p className="text-sm text-emerald-700">{msg}</p>}
          {err && <p className="text-sm text-red-600">{err}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            Material por tipo de NR
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Vincule um PDF ou subpasta específica (ex.: só NR-35) para abrir direto ao aplicar o
            treinamento.
          </p>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Tipo de treinamento</label>
              <select
                value={catalogoId}
                onChange={(e) => setCatalogoId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {CATALOGO_TREINAMENTOS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.norma} — {c.titulo}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">URL do arquivo ou pasta</label>
              <input
                value={urlMaterial}
                onChange={(e) => setUrlMaterial(e.target.value)}
                placeholder="https://..."
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <Button
            type="button"
            className="bg-sgs-700 hover:bg-sgs-800"
            disabled={loading}
            onClick={salvarMaterial}
          >
            Vincular material
          </Button>

          <div className="space-y-2 pt-2">
            {(empresa?.materiaisTreinamento || []).length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum material específico vinculado ainda.</p>
            ) : (
              empresa?.materiaisTreinamento.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{m.titulo}</p>
                    <p className="text-xs text-slate-500">{m.norma}</p>
                  </div>
                  <div className="flex gap-2">
                    <a href={m.url} target="_blank" rel="noopener noreferrer">
                      <Button type="button" size="sm" variant="outline">
                        <ExternalLink className="w-3.5 h-3.5" />
                        Abrir
                      </Button>
                    </a>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={loading}
                      onClick={() => remover(m.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
