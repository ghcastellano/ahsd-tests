"use client";

import { useEffect, useRef, useState } from "react";
import type { ResultRecord } from "@/lib/history";
import { shareLink } from "@/lib/share";

/**
 * Bloco "enviar ao avaliador": gera um link curto para a página /resultado, com
 * o registro codificado no fragmento (#) — que nunca é enviado a servidores.
 * Quem abre o link vê o resultado formatado e pode guardá-lo no próprio painel.
 */
export default function ShareBlock({ record }: { record: ResultRecord }) {
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");
  const [url, setUrl] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setUrl(shareLink(window.location.origin, record));
  }, [record]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function flash(state: "ok" | "fail") {
    setCopied(state);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied("idle"), 2500);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      flash("ok");
    } catch {
      // Fallback para contextos sem clipboard API — só confirma se funcionou.
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      const success = document.execCommand("copy");
      document.body.removeChild(ta);
      flash(success ? "ok" : "fail");
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({
        title: `Resultado ${record.acronym}`,
        text: `Resultado do rastreio ${record.acronym}: ${record.bandLabel}. Abra para ver o detalhamento.`,
        url,
      });
    } catch {
      // usuário cancelou ou share indisponível — sem problema
    }
  }

  return (
    <div className="no-print mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
      <h2 className="text-lg font-semibold text-emerald-900">
        Compartilhar este resultado
      </h2>
      <p className="mt-1 text-sm text-emerald-900">
        O link abaixo abre uma página com este resultado já formatado — pontuação, faixa e
        detalhamento por dimensão. Ele carrega o resultado dentro do próprio endereço, sem passar
        por nenhum servidor, e quem receber pode guardá-lo no painel dele com um clique.
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
          {copied === "ok"
            ? "Link copiado ✓"
            : copied === "fail"
              ? "Falhou — copie do campo acima"
              : "Copiar link do resultado"}
        </button>
        <a
          href={url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-emerald-600 px-5 py-2.5 font-medium text-emerald-700 transition hover:bg-emerald-100"
        >
          Ver como o link abre
        </a>
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
