import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rastreio AH/SD e Neurodivergências",
  description:
    "Plataforma de triagem com questionários validados de Altas Habilidades/Superdotação, TDAH, autismo, humor, ansiedade e trauma — com avaliação e detalhamento.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="no-print border-b border-slate-200 bg-white">
            <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 font-bold text-brand-700">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                  ✦
                </span>
                <span>Rastreio AH/SD</span>
              </Link>
              <nav className="flex items-center gap-4 text-sm">
                <Link href="/" className="hover:text-brand-700">
                  Testes
                </Link>
                <Link href="/sobre" className="hover:text-brand-700">
                  Sobre
                </Link>
              </nav>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="no-print border-t border-slate-200 bg-white">
            <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-slate-500 space-y-1">
              <p>
                Esta plataforma oferece <strong>triagem e orientação inicial</strong>. Não substitui
                avaliação, diagnóstico ou tratamento por profissional qualificado.
              </p>
              <p>
                Em caso de sofrimento intenso ou pensamentos de morte, procure ajuda. CVV: 188
                (24h, gratuito) — cvv.org.br.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
