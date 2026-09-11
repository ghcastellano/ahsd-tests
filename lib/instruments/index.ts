import type { CategoryMeta, Instrument } from "../types";
import { ahsdIndicadores } from "./ahsd-indicadores";
import { sobreExcitabilidades } from "./sobre-excitabilidades";
import { impostorAutossabotagem } from "./impostor-autossabotagem";
import { perfeccionismoAutocritica } from "./perfeccionismo-autocritica";
import { perfilSensorial } from "./perfil-sensorial";
import { cincoGrandes } from "./cinco-grandes";
import { bemEstarContexto } from "./bem-estar-contexto";
import { phq9 } from "./phq9";
import { gad7 } from "./gad7";
import { asrs } from "./asrs";
import { aq50 } from "./aq50";
import { mdq } from "./mdq";
import { hcl32 } from "./hcl32";
import { pcl5 } from "./pcl5";
import { ace } from "./ace";
import { raadsR } from "./raads-r";
import { ders } from "./ders";
import { asrsAbda } from "./asrs-abda";
import { snapIv } from "./snap-iv";
import { wurs25 } from "./wurs-25";
import { bis11 } from "./bis-11";
import { swan } from "./swan";

export const instruments: Instrument[] = [
  ahsdIndicadores,
  sobreExcitabilidades,
  perfeccionismoAutocritica,
  impostorAutossabotagem,
  perfilSensorial,
  cincoGrandes,
  bemEstarContexto,
  asrs,
  asrsAbda,
  wurs25,
  bis11,
  snapIv,
  swan,
  aq50,
  raadsR,
  phq9,
  gad7,
  mdq,
  hcl32,
  pcl5,
  ace,
  ders,
];

export const categories: CategoryMeta[] = [
  {
    key: "altas-habilidades",
    name: "Altas Habilidades / Superdotação",
    description: "Indicadores, intensidades, personalidade e contexto — o foco central da plataforma.",
    accent: "brand",
  },
  {
    key: "tdah",
    name: "TDAH",
    description: "Sintomas atuais (ASRS/OMS e ASRS-ABDA), infância retrospectiva (WURS-25), impulsividade (BIS-11) e as escalas para crianças e adolescentes (SNAP-IV e SWAN).",
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
  {
    key: "regulacao-emocional",
    name: "Regulação Emocional",
    description: "Como você percebe, aceita e maneja suas emoções.",
    accent: "emerald",
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
