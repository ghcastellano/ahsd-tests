import type { CategoryMeta, Instrument } from "../types";
import { ahsdIndicadores } from "./ahsd-indicadores";
import { sobreExcitabilidades } from "./sobre-excitabilidades";
import { phq9 } from "./phq9";
import { gad7 } from "./gad7";
import { asrs } from "./asrs";
import { aq50 } from "./aq50";
import { mdq } from "./mdq";
import { hcl32 } from "./hcl32";
import { pcl5 } from "./pcl5";
import { ace } from "./ace";

export const instruments: Instrument[] = [
  ahsdIndicadores,
  sobreExcitabilidades,
  asrs,
  aq50,
  phq9,
  gad7,
  mdq,
  hcl32,
  pcl5,
  ace,
];

export const categories: CategoryMeta[] = [
  {
    key: "altas-habilidades",
    name: "Altas Habilidades / Superdotação",
    description: "Indicadores de AH/SD e sobre-excitabilidades — o foco central da plataforma.",
    accent: "brand",
  },
  {
    key: "tdah",
    name: "TDAH",
    description: "Rastreio de déficit de atenção e hiperatividade no adulto.",
    accent: "amber",
  },
  {
    key: "autismo",
    name: "Espectro Autista",
    description: "Traços do espectro autista em adultos.",
    accent: "teal",
  },
  {
    key: "humor",
    name: "Humor (Depressão e Bipolaridade)",
    description: "Depressão, mania e hipomania.",
    accent: "rose",
  },
  {
    key: "ansiedade",
    name: "Ansiedade",
    description: "Sintomas de ansiedade generalizada.",
    accent: "sky",
  },
  {
    key: "trauma",
    name: "Trauma e Adversidade",
    description: "Estresse pós-traumático e experiências adversas na infância.",
    accent: "violet",
  },
];

const byId = new Map(instruments.map((i) => [i.id, i]));

export function getInstrument(id: string): Instrument | undefined {
  return byId.get(id);
}

export function instrumentsByCategory(category: string): Instrument[] {
  return instruments.filter((i) => i.category === category);
}

export function getCategory(key: string): CategoryMeta | undefined {
  return categories.find((c) => c.key === key);
}
