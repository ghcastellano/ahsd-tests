import type { Metadata } from "next";
import MatrixQuiz from "@/components/MatrixQuiz";

export const metadata: Metadata = {
  title: "Treino de Raciocínio Fluido — matrizes estilo Mensa",
  description:
    "30 matrizes progressivas originais, cronometradas (25 min), no formato dos testes de admissão da Mensa. Treino sem validade normativa — não gera QI.",
};

export default function TesteQiPage() {
  return <MatrixQuiz />;
}
