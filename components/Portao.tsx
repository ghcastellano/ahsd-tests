"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { destinoSeguro } from "@/lib/portao";

/** Tela de senha de entrada: um campo, um botão, nada mais. */
export default function Portao() {
  const params = useSearchParams();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    if (!senha || enviando) return;
    setEnviando(true);
    setErro(null);
    try {
      const res = await fetch("/api/entrar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ senha }) });
      if (res.ok) {
        // Navegação completa: o cookie recém-gravado precisa ir no primeiro pedido.
        window.location.assign(destinoSeguro(params.get("next")));
        return;
      }
      setErro(res.status === 401 ? "Senha incorreta." : "Não foi possível entrar. Tente de novo.");
    } catch {
      setErro("Sem conexão. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-4 py-16" data-portao>
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-2xl text-white">✦</div>
        <h1 className="mt-4 text-center text-xl font-bold text-slate-900">Rastreio AH/SD</h1>
        <p className="mt-1 text-center text-sm text-slate-500">Acesso restrito. Digite a senha para entrar.</p>
        <form onSubmit={entrar} className="mt-6">
          <label htmlFor="senha-site" className="sr-only">Senha</label>
          <input
            id="senha-site"
            name="password"
            type="password"
            autoComplete="current-password"
            autoFocus
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-center text-lg tracking-widest focus:border-brand-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!senha || enviando}
            className="mt-3 w-full rounded-lg bg-brand-600 px-4 py-3 font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {enviando ? "Entrando…" : "Entrar"}
          </button>
          {erro && <p className="mt-3 text-center text-sm text-rose-600" role="alert">{erro}</p>}
        </form>
      </div>
    </div>
  );
}
