"use client";

import { useEffect, useState } from "react";
import type { ResultRecord } from "@/lib/history";
import { shareLink } from "@/lib/share";

/**
 * Bloco "enviar ao avaliador": gera um link que carrega o resultado no próprio
 * endereço (fragmento #, que não passa por servidores). Quem abre o link vê o
 * registro entrar no painel do próprio aparelho.
 */
export default function ShareBlock({ record }: { record: ResultRecord }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(shareLink(window.location.origin, record));
  }, [record]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Fallback para contextos sem clipboard API.
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
    }
    setTimeout(() => setCopied(false), 2500);
  }

  async function nativeShare() {
    try {
      await navigator.share({
        title: `Resultado ${record.acronym}`,
        text: `Resultado do teste ${record.acronym} para importar no painel:`,
        url,
      });
    } catch {
      // usuário cancelou ou share indisponível — sem problema
    }
  }

  return (
    <div className="no-print mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
      <h2 className="text-lg font-semibold text-emerald-900">
        Enviar este resultado ao avaliador
      </h2>
      <p className="mt-1 text-sm text-emerald-900">
        O link abaixo carrega o resultado dentro do próprio endereço — sem passar por nenhum
        servidor. Envie por WhatsApp ou e-mail: quando o avaliador abrir, o resultado entra
        automaticamente no painel do aparelho dele.
      </p>
      <input
        readOnly
        aria-label="Link do resultado"
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        className="mt-3 w-full rounded-lg border border-emerald-300 bg-white px-3 py-2 font-mono text-xs text-slate-600 focus:outline-none"
      />
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void copy()}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 font-medium text-white transition hover:bg-emerald-700"
        >
          {copied ? "Link copiado ✓" : "Copiar link do resultado"}
        </button>
        {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
          <button
            type="button"
            onClick={() => void nativeShare()}
            className="rounded-lg border border-emerald-600 px-5 py-2.5 font-medium text-emerald-700 transition hover:bg-emerald-100"
          >
            Compartilhar…
          </button>
        )}
      </div>
      <p className="mt-2 text-xs text-emerald-800">
        O link contém as pontuações e a identificação (se informada) — compartilhe apenas com
        quem deve ver o resultado.
      </p>
    </div>
  );
}
