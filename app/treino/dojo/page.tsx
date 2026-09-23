import type { Metadata } from "next";
import Dojo from "@/components/Dojo";

export const metadata: Metadata = {
  title: "Dojo — treino ativo por exame (Mensa, Wechsler, Stanford-Binet, Cattell)",
  description:
    "Treino rápido com explicação após cada item: matrizes, séries, classificação, condições, verbal, aritmética, memória. Entenda a lógica de cada exame e pratique de forma inteligente.",
};

export default function DojoPage() {
  return <Dojo />;
}
