import type { Metadata } from "next";
import Simulador from "@/components/Simulador";

export const metadata: Metadata = {
  title: "Simulador de escalas — Wechsler · Stanford-Binet · Cattell",
  description:
    "Três blocos de treino com compreensão verbal, memória operacional, procura visual e matrizes. Itens autorais e suplemento ICAR; sem estimativa de QI.",
};

export default function SimuladorPage() {
  return <Simulador />;
}
