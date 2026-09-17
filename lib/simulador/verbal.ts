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
  V(1, "semelhancas", "Em que MAPA e RELÓGIO se parecem?", ["Ambos são redondos", "Ambos são feitos de papel", "Ambos representam por símbolos uma dimensão", "Ambos servem para viajar"], 2, "Ambos são representações convencionais de uma dimensão contínua: o mapa, do espaço; o relógio, do tempo.", 5),
  V(1, "analogia", "SEMENTE está para ÁRVORE assim como HIPÓTESE está para…", ["Erro", "Teoria", "Pergunta", "Experimento"], 1, "Origem → forma desenvolvida.", 6),
  V(1, "analogia", "CÉTICO está para DÚVIDA assim como DOGMÁTICO está para…", ["Certeza", "Religião", "Erro", "Ciência"], 0, "Postura → atitude central: o cético duvida, o dogmático afirma com certeza.", 7),
  V(1, "analogia", "TERMÔMETRO está para TEMPERATURA assim como BÚSSOLA está para…", ["Norte", "Direção", "Viagem", "Ímã"], 1, "Instrumento → grandeza que mede. 'Norte' é um valor da grandeza, não a grandeza.", 8),

  // ---------------- Nível 2 ----------------
  V(2, "vocabulario", "Qual alternativa tem o sentido mais próximo de PUSILÂNIME?", ["Generoso", "Covarde", "Minucioso", "Arrogante"], 1, "Pusilânime = de ânimo fraco; covarde.", 1),
  V(2, "vocabulario", "Qual alternativa tem o sentido mais próximo de APÓCRIFO?", ["Sagrado", "De autoria duvidosa", "Antigo", "Secreto"], 1, "Apócrifo = de autenticidade não reconhecida.", 2),
  V(2, "vocabulario", "Qual alternativa tem o sentido mais próximo de PROSAICO?", ["Poético", "Antigo", "Trivial", "Sagrado"], 2, "Prosaico = comum, sem elevação; trivial.", 3),
  V(2, "semelhancas", "Em que PARADOXO e IRONIA se parecem?", ["Ambos provocam riso", "Ambos separam a aparência do sentido", "Ambos são exclusivos da poesia", "Ambos são erros de lógica"], 1, "Ambos jogam com a distância entre o que parece e o que se quer dizer: o paradoxo parece contraditório e é verdadeiro; a ironia diz uma coisa para significar outra.", 4),
  V(2, "semelhancas", "Em que ENTROPIA e ESQUECIMENTO se parecem?", ["Ambos são reversíveis à vontade", "Ambos são perda gradual de ordem ou informação", "Ambos são fenômenos da física", "Ambos são causados por calor"], 1, "Ambos são perda progressiva: de ordem (entropia) e de informação (esquecimento).", 5),
  V(2, "analogia", "AXIOMA está para TEOREMA assim como PREMISSA está para…", ["Argumento", "Conclusão", "Hipótese", "Dúvida"], 1, "Ponto de partida → o que dele se deriva.", 6),
  V(2, "analogia", "EPIDEMIOLOGIA está para POPULAÇÃO assim como CLÍNICA está para…", ["Doença", "Hospital", "Indivíduo", "Tratamento"], 2, "Ciência → unidade de análise: população vs. indivíduo.", 7),
  V(2, "analogia", "CATALISADOR está para REAÇÃO assim como MEDIADOR está para…", ["Tribunal", "Acordo", "Juiz", "Silêncio"], 1, "Agente que facilita sem ser parte do resultado → o que ele facilita: o catalisador acelera a reação; o mediador facilita o acordo.", 8),

  // ---------------- Nível 3 ----------------
  V(3, "vocabulario", "Qual alternativa tem o sentido mais próximo de PRECÍPUO?", ["Precipitado", "Prévio", "Precioso", "Principal"], 3, "Precípuo = principal, essencial ('o objetivo precípuo'). Os três distratores partilham só o prefixo.", 1),
  V(3, "vocabulario", "Qual alternativa tem o sentido mais próximo de ANÓDINO?", ["Doloroso", "Inofensivo, sem efeito", "Barulhento", "Antigo"], 1, "Anódino = que acalma a dor; por extensão, inofensivo, insípido, sem efeito.", 2),
  V(3, "vocabulario", "Qual alternativa tem o sentido mais próximo de TERGIVERSAR?", ["Usar de evasivas", "Falar com firmeza", "Repetir a pergunta", "Traduzir de novo"], 0, "Tergiversar = desviar-se do assunto, responder com rodeios; usar subterfúgios.", 3),
  V(3, "semelhancas", "Em que METÁFORA e MODELO CIENTÍFICO se parecem?", ["Ambos são literais", "Ambos explicam uma coisa em termos de outra", "Ambos são verificáveis", "Ambos pertencem à literatura"], 1, "Ambos representam algo por meio de outra coisa — o átomo como sistema solar, o tempo como rio.", 4),
  V(3, "semelhancas", "Em que JURISPRUDÊNCIA e TRADIÇÃO se parecem?", ["Ambas são escritas", "Ambas usam o passado para orientar o presente", "Ambas são leis", "Ambas mudam rapidamente"], 1, "Decisões e práticas anteriores como guia do que se faz agora.", 5),
  V(3, "analogia", "MAPA está para TERRITÓRIO assim como TEORIA está para…", ["Hipótese", "Cientista", "Realidade", "Manual"], 2, "Representação → o que ela representa: o mapa simplifica o território; a teoria, a realidade. 'Hipótese' é parte da teoria, não seu objeto.", 6),
  V(3, "analogia", "ENTROPIA está para DESORDEM assim como HOMEOSTASE está para…", ["Calor", "Equilíbrio", "Crescimento", "Mudança"], 1, "Conceito → estado que ele descreve: a homeostase é a manutenção do equilíbrio interno.", 7),
  V(3, "analogia", "PARÊNTESE está para ORAÇÃO assim como DIGRESSÃO está para…", ["Vírgula", "Discurso", "Erro", "Silêncio"], 1, "Interrupção contida → unidade que ela interrompe: o parêntese suspende a oração; a digressão, o discurso.", 8),
  // ================= Banco adicional (variação por tentativa) =================
  // ---- Nível 1 ----
  V(1, "vocabulario", "Qual alternativa tem o sentido mais próximo de DIÁFANO?", ["Opaco", "Transparente e delicado", "Pesado", "Áspero"], 1, "Diáfano = que deixa passar a luz; translúcido, delicado.", 9),
  V(1, "vocabulario", "Qual alternativa tem o sentido mais próximo de CONTUMAZ?", ["Tímido", "Reincidente e obstinado", "Generoso", "Cauteloso"], 1, "Contumaz = que persiste no erro; reincidente, teimoso.", 10),
  V(1, "vocabulario", "Qual alternativa tem o sentido mais próximo de INSÓLITO?", ["Comum", "Incomum", "Agradável", "Antigo"], 1, "Insólito = fora do habitual; incomum, estranho.", 11),
  V(1, "vocabulario", "Qual alternativa tem o sentido mais próximo de VERSÁTIL?", ["Instável", "Adaptável a várias funções", "Poético", "Rápido"], 1, "Versátil = que se adapta a funções ou situações diversas. Instável é o distrator: mudar não é adaptar-se.", 12),
  V(1, "vocabulario", "Qual alternativa tem o sentido mais próximo de CADUCO?", ["Que perdeu a validade", "Enfermo", "Repetitivo", "Barulhento"], 0, "Caduco = que caducou, perdeu a validade ou o vigor (prazo caduco, lei caduca).", 13),
  V(1, "semelhancas", "Em que LEI e REGRA DE JOGO se parecem?", ["Ambas são criadas por um governo", "Ambas são normas aceitas por um grupo", "Ambas punem com prisão", "Ambas valem em qualquer lugar"], 1, "Ambas são normas: convenções que um grupo aceita e que regulam o comportamento dentro dele.", 14),
  V(1, "semelhancas", "Em que MEMÓRIA e ARQUIVO se parecem?", ["Ambos são digitais", "Ambos guardam informação para uso posterior", "Ambos são perfeitos", "Ambos ficam em prédios"], 1, "Ambos armazenam informação para recuperação futura.", 15),
  V(1, "semelhancas", "Em que HÁBITO e INSTINTO se parecem?", ["Ambos são aprendidos", "Ambos são conscientes", "Ambos produzem ação sem deliberação", "Ambos são exclusivos dos humanos"], 2, "Ambos disparam comportamento automático, sem decisão consciente — um aprendido, o outro inato.", 16),
  V(1, "semelhancas", "Em que RUMOR e EPIDEMIA se parecem?", ["Ambos são causados por vírus", "Ambos se espalham por contato entre pessoas", "Ambos são sempre falsos", "Ambos duram pouco"], 1, "Ambos se propagam de pessoa a pessoa e crescem com o contato: a mesma dinâmica de contágio.", 17),
  V(1, "analogia", "CHAVE está para PORTA assim como SENHA está para…", ["Teclado", "Conta", "Segredo", "Letra"], 1, "Meio de acesso → o que ele dá acesso: a chave abre a porta; a senha, a conta.", 18),
  V(1, "analogia", "TRADUTOR está para TEXTO assim como INTÉRPRETE está para…", ["Plateia", "Fala", "Idioma", "Livro"], 1, "Quem transpõe → o que transpõe: o tradutor verte o texto escrito; o intérprete, a fala.", 19),
  V(1, "analogia", "CANSAÇO está para DESCANSO assim como DÚVIDA está para…", ["Pergunta", "Erro", "Esclarecimento", "Silêncio"], 2, "Estado → o que o resolve: o descanso desfaz o cansaço; o esclarecimento desfaz a dúvida.", 20),
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
  V(2, "analogia", "MAQUETE está para EDIFÍCIO assim como PROTÓTIPO está para…", ["Desenho", "Produto", "Fábrica", "Ideia"], 1, "Modelo prévio → versão final: a maquete antecipa o edifício; o protótipo, o produto.", 18),
  V(2, "analogia", "ARGUMENTO está para CONVENCER assim como PROVA está para…", ["Julgar", "Demonstrar", "Duvidar", "Testar"], 1, "Meio → fim: o argumento visa convencer; a prova, demonstrar.", 19),
  V(2, "analogia", "MICROSCÓPIO está para PEQUENO assim como TELESCÓPIO está para…", ["Grande", "Distante", "Estrela", "Lente"], 1, "Instrumento → limitação que supera: o microscópio vence o tamanho; o telescópio, a distância.", 20),
  // ---- Nível 3 ----
  V(3, "vocabulario", "Qual alternativa tem o sentido mais próximo de LAPIDAR (como adjetivo: 'uma frase lapidar')?", ["Grosseira", "Concisa e perfeita, como gravada em pedra", "Brilhante", "Antiga"], 1, "Lapidar = digno de ser gravado em lápide; conciso e definitivo.", 9),
  V(3, "vocabulario", "O que é o VERNÁCULO?", ["Uma gíria", "A língua própria de um país ou região", "Um erro de gramática", "Um discurso formal"], 1, "Vernáculo = idioma próprio de um lugar, sem estrangeirismos.", 10),
  V(3, "vocabulario", "Qual alternativa tem o sentido mais próximo de ESPÚRIO?", ["Autêntico", "Falso e ilegítimo", "Raro", "Escondido"], 1, "Espúrio = não genuíno; falso, bastardo.", 11),
  V(3, "vocabulario", "Qual alternativa tem o sentido mais próximo de PERFUNCTÓRIO?", ["Executado com esmero", "Feito por alto, sem cuidado", "Imposto por lei", "Demorado e cansativo"], 1, "Perfunctório = superficial, feito apenas para cumprir a formalidade. 'Executado com esmero' é o antônimo.", 12),
  V(3, "vocabulario", "Qual alternativa tem o sentido mais próximo de PROSCREVER?", ["Descrever", "Proibir, banir", "Recomendar", "Prescrever"], 1, "Proscrever = banir, proibir. 'Prescrever' (receitar) é o distrator fonético.", 13),
  V(3, "semelhancas", "Em que ANTICORPO e SENHA se parecem?", ["Ambos são invisíveis", "Ambos distinguem o que pertence do que não pertence", "Ambos são biológicos", "Ambos são secretos"], 1, "Ambos reconhecem e barram o que é estranho ao sistema.", 14),
  V(3, "semelhancas", "Em que MITO e TEORIA se parecem?", ["Ambos são falsos", "Ambos são tentativas de explicar o mundo", "Ambos são científicos", "Ambos são antigos"], 1, "Ambos explicam fenômenos — com critérios de prova diferentes.", 15),
  V(3, "semelhancas", "Em que MOEDA e PALAVRA se parecem?", ["Ambas são de metal", "Ambas valem por convenção compartilhada", "Ambas são raras", "Ambas são impressas"], 1, "O valor de ambas vem de um acordo coletivo, não da matéria.", 16),
  V(3, "semelhancas", "Em que FEBRE e INFLAÇÃO se parecem?", ["Ambas são doenças", "Ambas são sinais de um desequilíbrio do sistema", "Ambas são causadas por vírus", "Ambas são boas"], 1, "Ambas são sintomas de algo subjacente, não a causa em si.", 17),
  V(3, "analogia", "DEDUÇÃO está para REGRA GERAL assim como INDUÇÃO está para…", ["Exceção", "Casos observados", "Lógica", "Conclusão"], 1, "Ponto de partida do raciocínio: a dedução parte da regra; a indução, dos casos.", 18),
  V(3, "analogia", "EROSÃO está para ROCHA assim como INFLAÇÃO está para…", ["Preço", "Poder de compra", "Banco central", "Comércio"], 1, "Processo de desgaste gradual → o que é desgastado: a erosão consome a rocha; a inflação corrói o poder de compra.", 19),
  V(3, "analogia", "CÉLULA está para TECIDO assim como PALAVRA está para…", ["Letra", "Frase", "Livro", "Língua"], 1, "Unidade → nível imediatamente superior que ela compõe.", 20),
  // ---- Itens adicionais (auditoria de 2026-09): posição da resposta variada ----
  V(3, "vocabulario", "Qual alternativa tem o sentido mais próximo de CONSPÍCUO?", ["Digno de suspeita", "Que conspira", "Notável, evidente", "Discreto, apagado"], 2, "Conspícuo = que salta aos olhos; ilustre, notável. 'Discreto' é o antônimo; 'que conspira' é o distrator fonético.", 21),
  V(3, "semelhancas", "Em que ALFABETO e SISTEMA DE NUMERAÇÃO se parecem?", ["Ambos foram criados na Grécia", "Ambos têm exatamente dez elementos", "Ambos exigem um som para cada símbolo", "Ambos geram infinitas combinações com poucos símbolos"], 3, "Ambos são sistemas combinatórios: um conjunto finito de símbolos produz formas ilimitadas pela posição e pela ordem.", 22),
  V(3, "semelhancas", "Em que ECOSSISTEMA e ECONOMIA se parecem?", ["Ambos são redes de dependência mútua por trocas", "Ambos são objeto da biologia", "Ambos crescem sem limite", "Ambos foram projetados por alguém"], 0, "Ambos são sistemas de interdependência: cada participante vive do que troca com os outros, e ninguém os desenhou.", 23),
  V(3, "semelhancas", "Em que SILÊNCIO e ZERO se parecem?", ["Ambos são ausências que significam algo", "Ambos são impossíveis de representar", "Ambos indicam erro ou falha", "Ambos foram inventados na Índia"], 0, "Ambos são a ausência de algo (som, quantidade) que, dentro de um sistema, carrega significado próprio.", 24),
  V(2, "vocabulario", "Qual alternativa tem o sentido mais próximo de INCIPIENTE?", ["Ignorante", "Frágil", "Que está no começo", "Ultrapassado"], 2, "Incipiente = que começa, inicial. 'Ignorante' é o distrator homófono: insipiente (sem saber).", 21),
  V(2, "vocabulario", "Qual alternativa tem o sentido mais próximo de OBSTAR?", ["Impedir", "Observar", "Insistir", "Obrigar"], 0, "Obstar = opor-se, impedir ('nada obsta a que…'). Os distratores partilham só as letras iniciais.", 22),
  V(2, "semelhancas", "Em que FRONTEIRA e HORÁRIO se parecem?", ["Ambos são cortes convencionais em algo contínuo", "Ambos existem na natureza", "Ambos são fixados por tratado", "Ambos aparecem só em mapas"], 0, "Ambos dividem por convenção um contínuo — o espaço e o tempo — em unidades que não existem 'lá fora'.", 23),
  V(2, "semelhancas", "Em que ANTÍDOTO e DESCULPA se parecem?", ["Ambos são produtos químicos", "Ambos evitam que o mal aconteça", "Ambos procuram anular um dano já feito", "Ambos funcionam sempre"], 2, "Ambos são remédios corretivos: agem depois do dano para neutralizá-lo. 'Evitar que aconteça' é prevenção, não correção.", 24),
  V(2, "analogia", "RECEITA está para BOLO assim como PARTITURA está para…", ["Piano", "Execução", "Compositor", "Pauta"], 1, "Instruções → resultado que produzem: a receita orienta o bolo; a partitura, a execução da música.", 25),
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
    out.push(...pool.slice(0, POR_FORMATO[fmt]).map((q) => embaralharOpcoes(q, rnd)));
  }
  return out;
}

/**
 * Embaralha as alternativas (e recalcula `resposta`). Sem isso, a posição da
 * resposta no banco vira pista — a auditoria encontrou 55/60 itens com a
 * resposta na 2ª alternativa.
 */
export function embaralharOpcoes(q: ItemVerbal, rnd: () => number): ItemVerbal {
  const idx = q.opcoes.map((_, i) => i);
  for (let k = idx.length - 1; k > 0; k--) { const j = Math.floor(rnd() * (k + 1)); [idx[k], idx[j]] = [idx[j], idx[k]]; }
  return { ...q, opcoes: idx.map((i) => q.opcoes[i]), resposta: idx.indexOf(q.resposta) };
}
