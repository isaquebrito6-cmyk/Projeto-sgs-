import { EmpresaForm } from "@/components/forms/empresa-form";

export default function NovaEmpresaPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Nova empresa</h1>
        <p className="text-slate-500 mt-1">
          Preencha os dados cadastrais da empresa
        </p>
      </div>
      <EmpresaForm />
    </div>
  );
}
