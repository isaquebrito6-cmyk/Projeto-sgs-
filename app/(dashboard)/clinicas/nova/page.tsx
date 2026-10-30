import { ClinicaForm } from "@/components/forms/clinica-form";

export default function NovaClinicaPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Nova clínica</h1>
        <p className="text-slate-500 mt-1">Cadastre uma clínica de medicina ocupacional</p>
      </div>
      <ClinicaForm />
    </div>
  );
}
