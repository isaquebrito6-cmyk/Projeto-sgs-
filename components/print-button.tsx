"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-md bg-sgs-700 px-4 py-2 text-sm font-medium text-white hover:bg-sgs-800"
    >
      Imprimir / Salvar PDF
    </button>
  );
}
