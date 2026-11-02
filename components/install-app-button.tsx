"use client";

import { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function InstallAppButton({
  variant = "outline",
  className,
}: {
  variant?: "outline" | "default";
  className?: string;
}) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  async function handleInstall() {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setDeferred(null);
      return;
    }
    if (isIos()) {
      setIosHint(true);
      return;
    }
    // Desktop sem evento ainda — orienta o menu do navegador
    setIosHint(false);
    alert(
      "Para instalar: no menu do navegador, escolha “Instalar aplicativo” ou “Adicionar à tela inicial”.
    );
  }

  return (
    <div className={className}>
      <Button type="button" variant={variant} onClick={handleInstall} className="w-full sm:w-auto">
        {isIos() ? (
          <>
            <Share className="w-4 h-4" />
            Instalar app
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Instalar app
          </>
        )}
      </Button>
      {iosHint && (
        <p className="text-xs text-slate-500 mt-2 max-w-xs">
          No iPhone/iPad: toque em <strong>Compartilhar</strong> →{" "}
          <strong>Adicionar à Tela de Início</strong>.
        </p>
      )}
    </div>
  );
}
