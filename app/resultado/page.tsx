import type { Metadata } from "next";
import SharedResult from "@/components/SharedResult";

export const metadata: Metadata = {
  title: "Resultado compartilhado",
  // O resultado viaja no fragmento da URL (nunca chega ao servidor), mas ainda
  // assim a página não deve ser indexada.
  robots: { index: false, follow: false },
};

export default function ResultadoPage() {
  return <SharedResult />;
}
