"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import {
  createSetor,
  createFuncao,
  deleteSetor,
  deleteFuncao,
} from "@/app/actions/setores";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Funcao = { id: string; nome: string; cbo: string | null };
type Setor = {
  id: string;
  nome: string;
  descricao: string | null;
  funcoes: Funcao[];
  _count: { colaboradores: number };
};

export function EmpresaSetores({ empresaId, setores: initial }: { empresaId: string; setores: Setor[] }) {
  const router = useRouter();
  const [setores, setSetores] = useState(initial);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showNewSetor, setShowNewSetor] = useState(false);
  const [newSetorNome, setNewSetorNome] = useState("");
  const [newFuncao, setNewFuncao] = useState<{ setorId: string; nome: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreateSetor() {
    if (!newSetorNome.trim()) return;
    setLoading(true);
    await createSetor(empresaId, newSetorNome);
    setNewSetorNome("");
    setShowNewSetor(false);
    setLoading(false);
    router.refresh();
  }

  async function handleCreateFuncao() {
    if (!newFuncao?.nome.trim()) return;
    setLoading(true);
    await createFuncao(newFuncao.setorId, newFuncao.nome);
    setNewFuncao(null);
    setLoading(false);
    router.refresh();
  }

  async function handleDeleteSetor(id: string) {
    if (!confirm("Excluir este setor e suas funções?")) return;
    setLoading(true);
    await deleteSetor(id);
    setLoading(false);
    router.refresh();
  }

  async function handleDeleteFuncao(id: string) {
    if (!confirm("Excluir esta função?")) return;
    setLoading(true);
    await deleteFuncao(id);
    setLoading(false);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Setores e Funções</CardTitle>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowNewSetor(true)}
          disabled={loading}
        >
          <Plus className="w-4 h-4" />
          Novo setor
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {showNewSetor && (
          <div className="flex gap-2 items-center p-3 rounded-lg bg-slate-50 border">
            <input
              autoFocus
              value={newSetorNome}
              onChange={(e) => setNewSetorNome(e.target.value)}
              placeholder="Nome do setor"
              className="flex h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onKeyDown={(e) => e.key === "Enter" && handleCreateSetor()}
            />
            <Button size="sm" onClick={handleCreateSetor} disabled={loading} className="bg-sgs-700 hover:bg-sgs-800">
              Salvar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowNewSetor(false)}>
              Cancelar
            </Button>
          </div>
        )}

        {setores.length === 0 && !showNewSetor && (
          <p className="text-sm text-slate-500 text-center py-4">
            Nenhum setor cadastrado. Crie setores e funções para organizar os colaboradores.
          </p>
        )}

        {setores.map((setor) => (
          <div key={setor.id} className="border rounded-lg">
            <div
              className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50"
              onClick={() => setExpanded(expanded === setor.id ? null : setor.id)}
            >
              <div className="flex items-center gap-2">
                {expanded === setor.id ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
                <span className="font-medium text-sm">{setor.nome}</span>
                <span className="text-xs text-slate-400">
                  {setor.funcoes.length} função(ões) · {setor._count.colaboradores} colab.
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSetor(setor.id);
                }}
                className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {expanded === setor.id && (
              <div className="border-t px-3 py-2 space-y-1.5 bg-slate-50/50">
                {setor.funcoes.map((f) => (
                  <div key={f.id} className="flex items-center justify-between py-1.5 px-2 text-sm">
                    <span>
                      {f.nome}
                      {f.cbo && <span className="text-slate-400 ml-2">CBO {f.cbo}</span>}
                    </span>
                    <button
                      onClick={() => handleDeleteFuncao(f.id)}
                      className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {newFuncao?.setorId === setor.id ? (
                  <div className="flex gap-2 items-center pt-1">
                    <input
                      autoFocus
                      value={newFuncao.nome}
                      onChange={(e) => setNewFuncao({ ...newFuncao, nome: e.target.value })}
                      placeholder="Nome da função"
                      className="flex h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onKeyDown={(e) => e.key === "Enter" && handleCreateFuncao()}
                    />
                    <Button size="sm" onClick={handleCreateFuncao} disabled={loading} className="h-8 bg-sgs-700 hover:bg-sgs-800">
                      Salvar
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8" onClick={() => setNewFuncao(null)}>
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setNewFuncao({ setorId: setor.id, nome: "" })}
                    className="flex items-center gap-1 text-xs text-sgs-700 hover:text-sgs-900 font-medium pt-1 px-2"
                  >
                    <Plus className="w-3 h-3" /> Nova função
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
