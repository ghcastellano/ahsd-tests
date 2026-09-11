// Compreensão verbal (inteligência cristalizada) — itens ORIGINAIS em três
// formatos usados pelas escalas de inteligência: vocabulário (sentido mais
// próximo), semelhanças (o que duas coisas têm em comum) e analogias verbais.
// Três níveis de dificuldade, do mais comum ao mais raro. Nenhum item é
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
  // ---------------- Nível 1 ----------------
  V(1, "vocabulario", "Qual alternativa tem o sentido mais próximo de PERSPICAZ?", ["Teimoso", "Arguto", "Calado", "Impaciente"], 1, "Perspicaz = que percebe com agudeza; arguto é o sinônimo.", 1),
  V(1, "vocabulario", "Qual alternativa tem o sentido mais próximo de EFÊMERO?", ["Duradouro", "Frágil", "Passageiro", "Raro"], 2, "Efêmero = de curta duração, passageiro.", 2),
  V(1, "semelhancas", "Em que MAÇÃ e BANANA se parecem?", ["Ambas são doces", "Ambas são frutas", "Ambas têm casca amarela", "Ambas crescem em árvores"], 1, "A categoria abstrata (fruta) vale mais que um atributo concreto (doce, casca).", 3),
  V(1, "semelhancas", "Em que POEMA e ESTÁTUA se parecem?", ["Ambos são antigos", "Ambos são feitos de pedra", "Ambos são obras de arte", "Ambos são difíceis de entender"], 2, "A semelhança de categoria (obra de arte) supera atributos ocasionais.", 4),
  V(1, "analogia", "MÉDICO está para PACIENTE assim como ADVOGADO está para…", ["Juiz", "Cliente", "Lei", "Tribunal"], 1, "Relação profissional → quem é atendido.", 5),
  V(1, "analogia", "QUENTE está para FRIO assim como CLARO está para…", ["Luz", "Escuro", "Dia", "Brilho"], 1, "Antônimos.", 6),
  V(1, "vocabulario", "Qual alternativa tem o sentido mais próximo de MITIGAR?", ["Agravar", "Abrandar", "Esconder", "Repetir"], 1, "Mitigar = atenuar, abrandar.", 7),
  V(1, "analogia", "PÁGINA está para LIVRO assim como DEGRAU está para…", ["Casa", "Escada", "Subida", "Madeira"], 1, "Parte → todo.", 8),

  // ---------------- Nível 2 ----------------
  V(2, "vocabulario", "Qual alternativa tem o sentido mais próximo de LACÔNICO?", ["Prolixo", "Conciso", "Melancólico", "Preciso"], 1, "Lacônico = breve, que fala pouco; conciso.", 1),
  V(2, "vocabulario", "Qual alternativa tem o sentido mais próximo de PROSAICO?", ["Poético", "Antigo", "Trivial", "Sagrado"], 2, "Prosaico = comum, sem elevação; trivial.", 2),
  V(2, "semelhancas", "Em que ELOGIO e CRÍTICA se parecem?", ["Ambos são desagradáveis", "Ambos são avaliações", "Ambos são sinceros", "Ambos vêm de amigos"], 1, "Ambos são juízos de valor sobre algo — a categoria que os une.", 3),
  V(2, "semelhancas", "Em que MAPA e RELÓGIO se parecem?", ["Ambos são redondos", "Ambos usam números", "Ambos representam algo que não se vê diretamente", "Ambos servem para viajar"], 2, "Ambos são representações: de espaço e de tempo.", 4),
  V(2, "analogia", "SEMENTE está para ÁRVORE assim como HIPÓTESE está para…", ["Erro", "Teoria", "Pergunta", "Experimento"], 1, "Origem → forma desenvolvida.", 5),
  V(2, "analogia", "ESCASSEZ está para PREÇO assim como DEMANDA está para…", ["Oferta", "Custo", "Consumo", "Preço"], 3, "O que sobe faz o preço subir: escassez e demanda elevam o preço.", 6),
  V(2, "vocabulario", "Qual alternativa tem o sentido mais próximo de INEXORÁVEL?", ["Inevitável", "Injusto", "Lento", "Silencioso"], 0, "Inexorável = que não se deixa demover; inevitável, implacável.", 7),
  V(2, "analogia", "CÉTICO está para DÚVIDA assim como DOGMÁTICO está para…", ["Certeza", "Religião", "Erro", "Ciência"], 0, "Postura → atitude central: o cético duvida, o dogmático afirma com certeza.", 8),

  // ---------------- Nível 3 ----------------
  V(3, "vocabulario", "Qual alternativa tem o sentido mais próximo de PUSILÂNIME?", ["Generoso", "Covarde", "Minucioso", "Arrogante"], 1, "Pusilânime = de ânimo fraco; covarde.", 1),
  V(3, "vocabulario", "Qual alternativa tem o sentido mais próximo de APÓCRIFO?", ["Sagrado", "De autoria duvidosa", "Antigo", "Secreto"], 1, "Apócrifo = de autenticidade não reconhecida.", 2),
  V(3, "semelhancas", "Em que PARADOXO e IRONIA se parecem?", ["Ambos são engraçados", "Ambos dizem o contrário do que parecem dizer", "Ambos são figuras de linguagem antigas", "Ambos são erros de lógica"], 1, "Ambos operam pela contradição entre aparência e sentido.", 3),
  V(3, "semelhancas", "Em que ENTROPIA e ESQUECIMENTO se parecem?", ["Ambos são reversíveis", "Ambos aumentam com o tempo", "Ambos são fenômenos da física", "Ambos são causados por calor"], 1, "Ambos descrevem perda de ordem/informação ao longo do tempo.", 4),
  V(3, "analogia", "AXIOMA está para TEOREMA assim como PREMISSA está para…", ["Argumento", "Conclusão", "Hipótese", "Dúvida"], 1, "Ponto de partida → o que dele se deriva.", 5),
  V(3, "analogia", "EPIDEMIOLOGIA está para POPULAÇÃO assim como CLÍNICA está para…", ["Doença", "Hospital", "Indivíduo", "Tratamento"], 2, "Ciência → unidade de análise: população vs. indivíduo.", 6),
  V(3, "vocabulario", "Qual alternativa tem o sentido mais próximo de SOFISMA?", ["Verdade evidente", "Argumento falso com aparência de válido", "Discurso longo", "Sabedoria prática"], 1, "Sofisma = raciocínio capcioso, falacioso.", 7),
  V(3, "analogia", "CATALISADOR está para REAÇÃO assim como MEDIADOR está para…", ["Conflito", "Acordo", "Juiz", "Silêncio"], 1, "O catalisador acelera a reação sem se consumir; o mediador facilita o acordo sem ser parte.", 8),
];

export function itensVerbais(nivel: Nivel): ItemVerbal[] {
  return ITENS_VERBAIS.filter((i) => i.nivel === nivel);
}
