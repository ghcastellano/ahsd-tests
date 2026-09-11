import type { Metadata } from "next";
import Simulador from "@/components/Simulador";

export const metadata: Metadata = {
  title: "Simulador de escalas — Wechsler · Stanford-Binet · Cattell",
  description:
    "Três blocos crescentes com compreensão verbal, memória operacional, velocidade de processamento e raciocínio fluido — os quatro domínios das escalas completas de inteligência.",
};

export default function SimuladorPage() {
  return <Simulador />;
}
