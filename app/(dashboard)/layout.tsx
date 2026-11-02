"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Shield,
  LayoutDashboard,
  Building2,
  Users,
  Stethoscope,
  FileText,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Hospital,
  GraduationCap,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { InstallAppButton } from "@/components/install-app-button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/empresas", label: "Empresas", icon: Building2 },
  { href: "/clinicas", label: "Clínicas", icon: Hospital },
  { href: "/colaboradores", label: "Colaboradores", icon: Users },
  { href: "/pgr", label: "PGR", icon: FileText },
  { href: "/pcmso", label: "PCMSO", icon: Stethoscope },
  { href: "/exames", label: "Exames / ASO", icon: ClipboardList },
  { href: "/treinamentos", label: "Treinamentos", icon: GraduationCap },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="lg:hidden sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-white px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 rounded-md hover:bg-slate-100"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sgs-700 to-sgs-900 flex items-center justify-center ring-2 ring-amber-400/80 shadow-sm">
            <Shield className="w-4 h-4 text-amber-300" />
          </div>
          <span className="font-bold text-sgs-900 tracking-tight">SGS</span>
        </div>
      </header>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between px-4 border-b lg:h-16">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-sgs-900 flex items-center justify-center ring-2 ring-amber-400 shadow-md">
              <Shield className="w-4.5 h-4.5 text-amber-300" />
            </div>
            <div className="leading-tight">
              <span className="font-extrabold text-lg text-sgs-900 tracking-tight">SGS</span>
              <p className="text-[10px] text-slate-400 font-medium">Segurança do Trabalho</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-md hover:bg-slate-100 lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sgs-100 text-sgs-800"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t space-y-2 bg-white">
          <InstallAppButton className="w-full" />
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      <main className="lg:pl-64">
        <div className="container max-w-7xl mx-auto p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
