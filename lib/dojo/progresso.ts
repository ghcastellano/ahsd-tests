import type { ExameDojo } from "./tipos";

// Progresso do dojo: fica só no aparelho (localStorage). Guarda dias
// praticados, acertos por domínio e os últimos erros (com a regra), para o
// plano do dia apontar o que treinar.

export interface ProgressoDojo {
  dias: string[]; // YYYY-MM-DD
  dominios: Record<string, { tentativas: number; acertos: number }>;
  erros: { dominio: string; regra: string; dia: string }[]; // últimos 40
}

export const CHAVE_PROGRESSO = "ahsd:dojo:v1";

export const vazio = (): ProgressoDojo => ({ dias: [], dominios: {}, erros: [] });

export function hojeISO(agora: Date = new Date()): string {
  const y = agora.getFullYear();
  const m = String(agora.getMonth() + 1).padStart(2, "0");
  const d = String(agora.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function carregar(): ProgressoDojo {
  if (typeof window === "undefined") return vazio();
  try {
    const raw = window.localStorage.getItem(CHAVE_PROGRESSO);
    if (!raw) return vazio();
    const p = JSON.parse(raw) as Partial<ProgressoDojo>;
    return { dias: Array.isArray(p.dias) ? p.dias : [], dominios: p.dominios ?? {}, erros: Array.isArray(p.erros) ? p.erros : [] };
  } catch {
    return vazio();
  }
}

export function salvar(p: ProgressoDojo): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAVE_PROGRESSO, JSON.stringify(p));
  } catch {
    // ignore
  }
}

export interface RespostaRegistrada { dominio: string; acertou: boolean; regra: string }

/** Registra uma rodada (função pura: devolve o novo progresso). */
export function registrar(p: ProgressoDojo, respostas: RespostaRegistrada[], dia: string = hojeISO()): ProgressoDojo {
  const dominios = { ...p.dominios };
  const erros = [...p.erros];
  for (const r of respostas) {
    const d = dominios[r.dominio] ?? { tentativas: 0, acertos: 0 };
    dominios[r.dominio] = { tentativas: d.tentativas + 1, acertos: d.acertos + (r.acertou ? 1 : 0) };
    if (!r.acertou) erros.push({ dominio: r.dominio, regra: r.regra.slice(0, 160), dia });
  }
  const dias = p.dias.includes(dia) ? p.dias : [...p.dias, dia].sort();
  return { dias, dominios, erros: erros.slice(-40) };
}

/** Dias seguidos de prática terminando hoje (ou ontem, se hoje ainda não praticou). */
export function sequencia(dias: string[], hoje: string = hojeISO()): number {
  const set = new Set(dias);
  const d = new Date(hoje + "T12:00:00");
  if (!set.has(hoje)) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(hojeISO(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

export function taxa(p: ProgressoDojo, dominio: string): number | null {
  const d = p.dominios[dominio];
  if (!d || d.tentativas === 0) return null;
  return d.acertos / d.tentativas;
}

/** Domínio mais fraco do exame com pelo menos 3 tentativas; null se não há dados. */
export function dominioMaisFraco(p: ProgressoDojo, ex: ExameDojo): { id: string; nome: string; taxa: number } | null {
  let pior: { id: string; nome: string; taxa: number } | null = null;
  for (const d of ex.dominios) {
    const t = p.dominios[d.id];
    if (!t || t.tentativas < 3) continue;
    const tx = t.acertos / t.tentativas;
    if (!pior || tx < pior.taxa) pior = { id: d.id, nome: d.nome, taxa: tx };
  }
  return pior;
}

/** Plano do dia: 3 passos concretos, adaptados ao histórico. */
export function planoDoDia(p: ProgressoDojo, ex: ExameDojo, hoje: string = hojeISO()): string[] {
  const seq = sequencia(p.dias, hoje);
  const fraco = dominioMaisFraco(p, ex);
  const errosRecentes = p.erros.filter((e) => ex.dominios.some((d) => d.id === e.dominio)).slice(-5);
  const passos: string[] = [];
  if (fraco) passos.push(`Aquecimento (5 min): 10 itens só de "${fraco.nome}", seu domínio mais fraco neste exame (${Math.round(fraco.taxa * 100)}% de acerto).`);
  else passos.push("Aquecimento (5 min): uma rodada mista de 10 itens para mapear seus domínios — o plano fica mais preciso a partir da terceira rodada.");
  if (errosRecentes.length) {
    const regras = [...new Set(errosRecentes.map((e) => e.regra.split(":")[0].slice(0, 60)))].slice(0, 3);
    passos.push(`Revisão (3 min): releia as regras que você errou por último — ${regras.join(" · ")} — e explique cada uma em voz alta antes de treinar.`);
  } else {
    passos.push("Revisão (3 min): leia o guia de regras e escolha UMA regra para caçar nos itens de hoje.");
  }
  passos.push(seq >= 3
    ? `Prova (10 min): rodada mista cronometrada. Você está há ${seq} dias seguidos — mantenha a sequência, mas não estenda: 20 minutos focados rendem mais que uma hora cansada.`
    : "Prova (10 min): rodada mista cronometrada. Meta desta semana: 3 dias seguidos de 20 minutos.");
  return passos;
}
