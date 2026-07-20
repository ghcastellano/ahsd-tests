import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-3xl font-bold text-slate-900">Página não encontrada</h1>
      <p className="mt-3 text-slate-600">O teste ou página que você procura não existe.</p>
      <Link href="/" className="mt-6 inline-block rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700">
        Voltar ao início
      </Link>
    </div>
  );
}
