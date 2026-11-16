import { NextResponse, type NextRequest } from "next/server";
import { NOME_COOKIE, tokenEsperado } from "@/lib/portao";

// Tudo passa pela senha de entrada, exceto a própria tela de senha, as rotas
// de API (cada uma tem a sua proteção) e os arquivos estáticos.
export async function middleware(req: NextRequest) {
  const cookie = req.cookies.get(NOME_COOKIE)?.value;
  if (cookie && cookie === (await tokenEsperado())) return NextResponse.next();
  const url = req.nextUrl.clone();
  const next = url.pathname + (url.search || "");
  url.pathname = "/entrar";
  url.search = next && next !== "/" ? `?next=${encodeURIComponent(next)}` : "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!entrar|api/|_next/|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|svg|ico|webp|txt|xml)$).*)"],
};
