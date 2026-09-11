import type { Metadata } from "next";
import GoNoGoTask from "@/components/GoNoGoTask";

export const metadata: Metadata = {
  title: "Go/NoGo — controle inibitório",
  description:
    "Tarefa objetiva de controle inibitório: erros de comissão, omissões e variabilidade do tempo de reação — os marcadores de desempenho mais ligados ao TDAH.",
};

export default function GoNoGoPage() {
  return <GoNoGoTask />;
}
