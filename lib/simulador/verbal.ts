// Compreensão verbal (inteligência cristalizada) — itens ORIGINAIS em três
// formatos usados pelas escalas de inteligência: vocabulário (sentido mais
// próximo), semelhanças (o que duas coisas têm em comum) e analogias verbais.
// Três níveis, todos acima da média adulta: o nível 1 é a ENTRADA do
// percentil 98 (vocabulário pouco comum, semelhanças abstratas), não o
// nível médio — "130" é o 2% superior, e a calibração inicial estava baixa. Nenhum item é
// copiado de teste comercial.

export type Nivel = 1 | 2 | 3;
export type FormatoVerbal = "vocabulario" | "semelhancas" | "analogia";

export interface ItemVerbal {
  id: string;
  nivel: Nivel;
  formato: FormatoVerbal;
  enunciado: string;
  opcoes: string[];
  resposta: number;
  explicacao: string;
}

const V = (nivel: Nivel, formato: FormatoVerbal, enunciado: string, opcoes: string[], resposta: number, explicacao: string, n: number): ItemVerbal => ({
  id: `v${nivel}-${n}`, nivel, formato, enunciado, opcoes, resposta, explicacao,
});

export const ITENS_VERBAIS: ItemVerbal[] = [
  // ---------------- Nível 1 — entrada do percentil 98 ----------------
  V(1, "vocabulario", "Qual alternativa tem o sentido mais próximo de LACÔNICO?", ["Prolixo", "Conciso", "Melancólico", "Preciso"], 1, "Lacônico = breve, que fala pouco; conciso. 'Preciso' é o distrator: ser breve não é ser exato.", 1),
  V(1, "vocabulario", "Qual alternativa tem o sentido mais próximo de INEXORÁVEL?", ["Inevitável", "Injusto", "Lento", "Silencioso"], 0, "Inexorável = que não se deixa demover; implacável, inevitável.", 2),
  V(1, "vocabulario", "Qual alternativa tem o sentido mais próximo de UBÍQUO?", ["Raro", "Presente em toda parte", "Antigo", "Escondido"], 1, "Ubíquo = onipresente, que está em toda parte ao mesmo tempo.", 3),
  V(1, "semelhancas", "Em que ELOGIO e CRÍTICA se parecem?", ["Ambos são desagradáveis", "Ambos são avaliações", "Ambos são sinceros", "Ambos vêm de amigos"], 1, "Ambos são juízos de valor sobre algo — a categoria que os une, acima do sinal (positivo/negativo).", 4),
  V(1, "semelhancas", "Em que MAPA e RELÓGIO se parecem?", ["Ambos são redondos", "Ambos usam números", "Ambos representam algo que não se vê diretamente", "Ambos servem para viajar"], 2, "Ambos são representações: de espaço e de tempo.", 5),
  V(1, "analogia", "SEMENTE está para ÁRVORE assim como HIPÓTESE está para…", ["Erro", "Teoria", "Pergunta", "Experimento"], 1, "Origem → forma desenvolvida.", 6),
  V(1, "analogia", "CÉTICO está para DÚVIDA assim como DOGMÁTICO está para…", ["Certeza", "Religião", "Erro", "Ciência"], 0, "Postura → atitude central: o cético duvida, o dogmático afirma com certeza.", 7),
  V(1, "analogia", "TERMÔMETRO está para TEMPERATURA assim como BÚSSOLA está para…", ["Norte", "Direção", "Viagem", "Ímã"], 1, "Instrumento → grandeza que mede. 'Norte' é um valor da grandeza, não a grandeza.", 8),

  // ---------------- Nível 2 ----------------
  V(2, "vocabulario", "Qual alternativa tem o sentido mais próximo de PUSILÂNIME?", ["Generoso", "Covarde", "Minucioso", "Arrogante"], 1, "Pusilânime = de ânimo fraco; covarde.", 1),
  V(2, "vocabulario", "Qual alternativa tem o sentido mais próximo de APÓCRIFO?", ["Sagrado", "De autoria duvidosa", "Antigo", "Secreto"], 1, "Apócrifo = de autenticidade não reconhecida.", 2),
  V(2, "vocabulario", "Qual alternativa tem o sentido mais próximo de PROSAICO?", ["Poético", "Antigo", "Trivial", "Sagrado"], 2, "Prosaico = comum, sem elevação; trivial.", 3),
  V(2, "semelhancas", "Em que PARADOXO e IRONIA se parecem?", ["Ambos são engraçados", "Ambos dizem o contrário do que parecem dizer", "Ambos são figuras de linguagem antigas", "Ambos são erros de lógica"], 1, "Ambos operam pela contradição entre aparência e sentido.", 4),
  V(2, "semelhancas", "Em que ENTROPIA e ESQUECIMENTO se parecem?", ["Ambos são reversíveis", "Ambos aumentam com o tempo", "Ambos são fenômenos da física", "Ambos são causados por calor"], 1, "Ambos descrevem perda de ordem/informação ao longo do tempo.", 5),
  V(2, "analogia", "AXIOMA está para TEOREMA assim como PREMISSA está para…", ["Argumento", "Conclusão", "Hipótese", "Dúvida"], 1, "Ponto de partida → o que dele se deriva.", 6),
  V(2, "analogia", "EPIDEMIOLOGIA está para POPULAÇÃO assim como CLÍNICA está para…", ["Doença", "Hospital", "Indivíduo", "Tratamento"], 2, "Ciência → unidade de análise: população vs. indivíduo.", 7),
  V(2, "analogia", "CATALISADOR está para REAÇÃO assim como MEDIADOR está para…", ["Conflito", "Acordo", "Juiz", "Silêncio"], 1, "O catalisador acelera a reação sem se consumir; o mediador facilita o acordo sem ser parte.", 8),

  // ---------------- Nível 3 ----------------
  V(3, "vocabulario", "Qual alternativa tem o sentido mais próximo de SOFISMA?", ["Verdade evidente", "Argumento falso com aparência de válido", "Discurso longo", "Sabedoria prática"], 1, "Sofisma = raciocínio capcioso, falacioso.", 1),
  V(3, "vocabulario", "Qual alternativa tem o sentido mais próximo de ANÓDINO?", ["Doloroso", "Inofensivo, sem efeito", "Barulhento", "Antigo"], 1, "Anódino = que acalma a dor; por extensão, inofensivo, insípido, sem efeito.", 2),
  V(3, "vocabulario", "Qual alternativa tem o sentido mais próximo de HERMÉTICO?", ["Transparente", "Fechado e de difícil compreensão", "Antigo", "Sagrado"], 1, "Hermético = perfeitamente fechado; figuradamente, obscuro, inacessível ao entendimento.", 3),
  V(3, "semelhancas", "Em que METÁFORA e MODELO CIENTÍFICO se parecem?", ["Ambos são literais", "Ambos explicam uma coisa em termos de outra", "Ambos são verificáveis", "Ambos pertencem à literatura"], 1, "Ambos representam algo por meio de outra coisa — o átomo como sistema solar, o tempo como rio.", 4),
  V(3, "semelhancas", "Em que JURISPRUDÊNCIA e TRADIÇÃO se parecem?", ["Ambas são escritas", "Ambas usam o passado para orientar o presente", "Ambas são leis", "Ambas mudam rapidamente"], 1, "Decisões e práticas anteriores como guia do que se faz agora.", 5),
  V(3, "analogia", "ORTOGRAFIA está para PALAVRA assim como SINTAXE está para…", ["Letra", "Frase", "Idioma", "Gramática"], 1, "Conjunto de regras → unidade que ele governa: a ortografia rege a palavra; a sintaxe, a frase.", 6),
  V(3, "analogia", "ENTROPIA está para DESORDEM assim como HOMEOSTASE está para…", ["Calor", "Equilíbrio", "Crescimento", "Mudança"], 1, "Conceito → estado que ele descreve: a homeostase é a manutenção do equilíbrio interno.", 7),
  V(3, "analogia", "ÁLIBI está para INOCÊNCIA assim como SINTOMA está para…", ["Saúde", "Doença", "Médico", "Cura"], 1, "Evidência → o que ela sustenta: o álibi sustenta a inocência; o sintoma, a doença.", 8),
];

export function itensVerbais(nivel: Nivel): ItemVerbal[] {
  return ITENS_VERBAIS.filter((i) => i.nivel === nivel);
}
