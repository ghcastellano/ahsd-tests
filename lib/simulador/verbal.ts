// Compreensão verbal (inteligência cristalizada) — itens ORIGINAIS em três
// formatos usados pelas escalas de inteligência: vocabulário (sentido mais
// próximo), semelhanças (o que duas coisas têm em comum) e analogias verbais.
// Três níveis, todos acima da média adulta: o nível 1 é a ENTRADA do
// percentil 98 (vocabulário pouco comum, semelhanças abstratas), não o
// nível médio — "130" é o 2% superior, e a calibração inicial estava baixa. Nenhum item é
// copiado de teste comercial.

import { mulberry32 } from "../battery/rng";

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
  // ================= Banco adicional (variação por tentativa) =================
  // ---- Nível 1 ----
  V(1, "vocabulario", "Qual alternativa tem o sentido mais próximo de DIÁFANO?", ["Opaco", "Transparente e delicado", "Pesado", "Áspero"], 1, "Diáfano = que deixa passar a luz; translúcido, delicado.", 9),
  V(1, "vocabulario", "Qual alternativa tem o sentido mais próximo de CONTUMAZ?", ["Tímido", "Reincidente e obstinado", "Generoso", "Cauteloso"], 1, "Contumaz = que persiste no erro; reincidente, teimoso.", 10),
  V(1, "vocabulario", "Qual alternativa tem o sentido mais próximo de INSÓLITO?", ["Comum", "Incomum", "Agradável", "Antigo"], 1, "Insólito = fora do habitual; incomum, estranho.", 11),
  V(1, "vocabulario", "O que é um PLEONASMO?", ["Um exagero", "Uma repetição desnecessária de ideia", "Uma contradição", "Uma comparação"], 1, "Pleonasmo = redundância ('subir para cima').", 12),
  V(1, "vocabulario", "Qual alternativa tem o sentido mais próximo de OBSOLETO?", ["Moderno", "Ultrapassado", "Caro", "Frágil"], 1, "Obsoleto = que caiu em desuso; ultrapassado.", 13),
  V(1, "semelhancas", "Em que LEI e REGRA DE JOGO se parecem?", ["Ambas são escritas", "Ambas são normas aceitas por um grupo", "Ambas são divertidas", "Ambas são naturais"], 1, "Ambas são convenções que regulam o comportamento dos que participam.", 14),
  V(1, "semelhancas", "Em que MEMÓRIA e ARQUIVO se parecem?", ["Ambos são digitais", "Ambos guardam informação para uso posterior", "Ambos são perfeitos", "Ambos ficam em prédios"], 1, "Ambos armazenam informação para recuperação futura.", 15),
  V(1, "semelhancas", "Em que SONO e ALIMENTAÇÃO se parecem?", ["Ambos acontecem à noite", "Ambos são necessidades do organismo", "Ambos são prazeres", "Ambos são opcionais"], 1, "Ambos são necessidades fisiológicas básicas.", 16),
  V(1, "semelhancas", "Em que RIO e ESTRADA se parecem?", ["Ambos são feitos pelo homem", "Ambos ligam lugares, servindo de caminho", "Ambos têm água", "Ambos são retos"], 1, "Ambos funcionam como vias que conectam lugares.", 17),
  V(1, "analogia", "CHAVE está para FECHADURA assim como SENHA está para…", ["Computador", "Conta", "Teclado", "Segredo"], 1, "O que abre → o que é aberto: a senha dá acesso à conta.", 18),
  V(1, "analogia", "AUTOR está para LIVRO assim como COMPOSITOR está para…", ["Piano", "Música", "Concerto", "Orquestra"], 1, "Criador → obra criada.", 19),
  V(1, "analogia", "FOME está para COMER assim como SEDE está para…", ["Água", "Beber", "Copo", "Calor"], 1, "Necessidade → ação que a satisfaz. 'Água' é o objeto, não a ação.", 20),
  // ---- Nível 2 ----
  V(2, "vocabulario", "Qual alternativa tem o sentido mais próximo de PERENE?", ["Passageiro", "Duradouro", "Anual", "Frágil"], 1, "Perene = que dura muito, permanente.", 9),
  V(2, "vocabulario", "O que é uma IDIOSSINCRASIA?", ["Uma doença rara", "Um traço peculiar próprio de alguém", "Um preconceito", "Um hábito coletivo"], 1, "Idiossincrasia = maneira de ser característica de um indivíduo.", 10),
  V(2, "vocabulario", "Qual alternativa tem o sentido mais próximo de DIRIMIR (uma dúvida)?", ["Aumentar", "Resolver", "Adiar", "Esconder"], 1, "Dirimir = dissipar, resolver, pôr fim a.", 11),
  V(2, "vocabulario", "Qual alternativa tem o sentido mais próximo de EXÍMIO?", ["Exilado", "Excelente", "Exigente", "Raro"], 1, "Exímio = excelente, muito hábil no que faz.", 12),
  V(2, "vocabulario", "Qual alternativa tem o sentido mais próximo de CIRCUNSPECTO?", ["Falante", "Prudente e reservado", "Redondo", "Distraído"], 1, "Circunspecto = ponderado, sério, comedido.", 13),
  V(2, "semelhancas", "Em que VACINA e SEGURO se parecem?", ["Ambos são obrigatórios", "Ambos são um custo presente para evitar um dano futuro", "Ambos são médicos", "Ambos são gratuitos"], 1, "Ambos trocam um custo certo agora por proteção contra um risco depois.", 14),
  V(2, "semelhancas", "Em que DICIONÁRIO e MAPA se parecem?", ["Ambos são livros", "Ambos são referências organizadas para encontrar algo", "Ambos são antigos", "Ambos têm cores"], 1, "Ambos organizam informação para localizar um item — uma palavra, um lugar.", 15),
  V(2, "semelhancas", "Em que ORQUESTRA e EQUIPE se parecem?", ["Ambas usam instrumentos", "Ambas coordenam papéis distintos para um objetivo comum", "Ambas são grandes", "Ambas competem"], 1, "Ambas integram partes diferentes num resultado conjunto.", 16),
  V(2, "semelhancas", "Em que SOMBRA e ECO se parecem?", ["Ambos são escuros", "Ambos dependem de uma fonte que os origina", "Ambos são sons", "Ambos são permanentes"], 1, "Ambos são efeitos derivados de outra coisa (um corpo, um som) e não existem sem ela.", 17),
  V(2, "analogia", "ESBOÇO está para PINTURA assim como RASCUNHO está para…", ["Caneta", "Texto final", "Erro", "Papel"], 1, "Versão preliminar → obra acabada.", 18),
  V(2, "analogia", "ARGUMENTO está para CONVENCER assim como PROVA está para…", ["Julgar", "Demonstrar", "Duvidar", "Testar"], 1, "Meio → fim: o argumento visa convencer; a prova, demonstrar.", 19),
  V(2, "analogia", "MICROSCÓPIO está para PEQUENO assim como TELESCÓPIO está para…", ["Grande", "Distante", "Estrela", "Lente"], 1, "Instrumento → limitação que supera: o microscópio vence o tamanho; o telescópio, a distância.", 20),
  // ---- Nível 3 ----
  V(3, "vocabulario", "Qual alternativa tem o sentido mais próximo de LAPIDAR (como adjetivo: 'uma frase lapidar')?", ["Grosseira", "Concisa e perfeita, como gravada em pedra", "Brilhante", "Antiga"], 1, "Lapidar = digno de ser gravado em lápide; conciso e definitivo.", 9),
  V(3, "vocabulario", "O que é o VERNÁCULO?", ["Uma gíria", "A língua própria de um país ou região", "Um erro de gramática", "Um discurso formal"], 1, "Vernáculo = idioma próprio de um lugar, sem estrangeirismos.", 10),
  V(3, "vocabulario", "Qual alternativa tem o sentido mais próximo de ESPÚRIO?", ["Autêntico", "Falso e ilegítimo", "Raro", "Escondido"], 1, "Espúrio = não genuíno; falso, bastardo.", 11),
  V(3, "vocabulario", "Qual alternativa tem o sentido mais próximo de INÓCUO?", ["Perigoso", "Que não causa dano", "Inútil", "Estranho"], 1, "Inócuo = inofensivo. 'Inútil' é o distrator: não causar dano não é não servir.", 12),
  V(3, "vocabulario", "Qual alternativa tem o sentido mais próximo de PROSCREVER?", ["Descrever", "Proibir, banir", "Recomendar", "Prescrever"], 1, "Proscrever = banir, proibir. 'Prescrever' (receitar) é o distrator fonético.", 13),
  V(3, "semelhancas", "Em que ANTICORPO e SENHA se parecem?", ["Ambos são invisíveis", "Ambos distinguem o que pertence do que não pertence", "Ambos são biológicos", "Ambos são secretos"], 1, "Ambos reconhecem e barram o que é estranho ao sistema.", 14),
  V(3, "semelhancas", "Em que MITO e TEORIA se parecem?", ["Ambos são falsos", "Ambos são tentativas de explicar o mundo", "Ambos são científicos", "Ambos são antigos"], 1, "Ambos explicam fenômenos — com critérios de prova diferentes.", 15),
  V(3, "semelhancas", "Em que MOEDA e PALAVRA se parecem?", ["Ambas são de metal", "Ambas valem por convenção compartilhada", "Ambas são raras", "Ambas são impressas"], 1, "O valor de ambas vem de um acordo coletivo, não da matéria.", 16),
  V(3, "semelhancas", "Em que FEBRE e INFLAÇÃO se parecem?", ["Ambas são doenças", "Ambas são sinais de um desequilíbrio do sistema", "Ambas são causadas por vírus", "Ambas são boas"], 1, "Ambas são sintomas de algo subjacente, não a causa em si.", 17),
  V(3, "analogia", "DEDUÇÃO está para REGRA GERAL assim como INDUÇÃO está para…", ["Exceção", "Casos observados", "Lógica", "Conclusão"], 1, "Ponto de partida do raciocínio: a dedução parte da regra; a indução, dos casos.", 18),
  V(3, "analogia", "SISMÓGRAFO está para TERREMOTO assim como BARÔMETRO está para…", ["Chuva", "Pressão atmosférica", "Vento", "Temperatura"], 1, "Instrumento → o que registra. 'Chuva' é o que se prevê a partir da pressão, não o que se mede.", 19),
  V(3, "analogia", "CÉLULA está para TECIDO assim como PALAVRA está para…", ["Letra", "Frase", "Livro", "Língua"], 1, "Unidade → nível imediatamente superior que ela compõe.", 20),
];

/** Quantos itens de cada formato entram numa tentativa (8 por bloco). */
export const POR_FORMATO: Record<FormatoVerbal, number> = { vocabulario: 3, semelhancas: 2, analogia: 3 };

export function bancoVerbal(nivel: Nivel): ItemVerbal[] {
  return ITENS_VERBAIS.filter((i) => i.nivel === nivel);
}

/**
 * 8 itens do nível, amostrados do banco de 20 por formato com a semente —
 * outra tentativa, outros itens, mesma mistura de formatos.
 */
export function itensVerbais(nivel: Nivel, seed = 0): ItemVerbal[] {
  const rnd = mulberry32((seed >>> 0) * 31 + nivel * 104729);
  const out: ItemVerbal[] = [];
  for (const fmt of Object.keys(POR_FORMATO) as FormatoVerbal[]) {
    const pool = bancoVerbal(nivel).filter((i) => i.formato === fmt);
    for (let k = pool.length - 1; k > 0; k--) { const j = Math.floor(rnd() * (k + 1)); [pool[k], pool[j]] = [pool[j], pool[k]]; }
    out.push(...pool.slice(0, POR_FORMATO[fmt]));
  }
  return out;
}
