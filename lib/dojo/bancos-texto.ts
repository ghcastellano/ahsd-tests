import type { ItemTexto } from "./tipos";

// Bancos de itens em texto, ORIGINAIS, com explicação. Cada item tem uma
// única resposta correta e a explicação mostra o raciocínio.

const T = (prefixo: string) => (n: number, enunciado: string, opcoes: string[], resposta: number, explicacao: string): ItemTexto => ({
  id: `${prefixo}${String(n).padStart(2, "0")}`, enunciado, opcoes, resposta, explicacao,
});

// ---------------------------------------------------------------------------
// Aritmética mental (WAIS-IV Aritmética / SB5 Raciocínio Quantitativo)
// ---------------------------------------------------------------------------
const A = T("ar");
export const ARITMETICA: ItemTexto[] = [
  A(1, "Um ônibus sai com 23 passageiros. Na primeira parada descem 8 e sobem 15. Quantos passageiros há agora?", ["28", "30", "31", "32"], 1, "23 − 8 = 15; 15 + 15 = 30. Faça as operações na ordem em que os fatos acontecem."),
  A(2, "Uma camisa custa R$ 60 depois de um desconto de 25%. Qual era o preço sem desconto?", ["R$ 75", "R$ 80", "R$ 85", "R$ 90"], 1, "R$ 60 corresponde a 75% do preço. 60 ÷ 0,75 = 80. Erro comum: somar 25% de 60 (= 75)."),
  A(3, "Se 3 máquinas produzem 3 peças em 3 minutos, quantas peças 6 máquinas produzem em 6 minutos?", ["6", "9", "12", "18"], 2, "Cada máquina faz 1 peça a cada 3 minutos. 6 máquinas em 6 minutos: 6 × 2 = 12. A armadilha é responder 6 por simetria."),
  A(4, "Um trem percorre 180 km em 1 hora e 30 minutos. Qual é a velocidade média?", ["90 km/h", "110 km/h", "120 km/h", "135 km/h"], 2, "1h30 = 1,5 h. 180 ÷ 1,5 = 120 km/h."),
  A(5, "Ana tem o dobro da idade de Bia. Juntas, têm 36 anos. Quantos anos tem Ana?", ["12", "18", "24", "27"], 2, "Bia = x, Ana = 2x; 3x = 36 → x = 12; Ana = 24."),
  A(6, "Numa sala há 40 pessoas e 60% são mulheres. Quantos homens há?", ["12", "16", "20", "24"], 1, "Homens = 40% de 40 = 16. Erro comum: calcular as mulheres (24) e parar."),
  A(7, "Uma torneira enche um tanque em 6 horas; outra, em 3 horas. As duas juntas enchem o tanque em quanto tempo?", ["1,5 h", "2 h", "4,5 h", "9 h"], 1, "Vazões: 1/6 + 1/3 = 1/2 do tanque por hora → 2 horas. Nunca some os tempos."),
  A(8, "Quantos inteiros de 1 a 100 são múltiplos de 3 ou de 5?", ["45", "47", "50", "53"], 1, "Múltiplos de 3: 33; de 5: 20; de 15 (contados duas vezes): 6. 33 + 20 − 6 = 47."),
  A(9, "Comprei um objeto por R$ 120 e vendi com lucro de 15%. Recomprei pelo preço de venda e revendi com prejuízo de 15%. Por quanto vendi da segunda vez?", ["R$ 114,00", "R$ 117,30", "R$ 120,00", "R$ 122,40"], 1, "120 × 1,15 = 138; 138 × 0,85 = 117,30. Percentuais iguais em sentidos opostos não se cancelam, porque incidem sobre bases diferentes."),
  A(10, "Um relógio adianta 3 minutos a cada 2 horas. Quanto ele adianta em 24 horas?", ["24 min", "30 min", "36 min", "48 min"], 2, "24 h contêm 12 períodos de 2 h; 12 × 3 = 36 minutos."),
  A(11, "A média de 5 números é 12. Retirando um deles, a média dos 4 restantes passa a 10. Qual número foi retirado?", ["14", "18", "20", "22"], 2, "Soma inicial: 5 × 12 = 60. Soma final: 4 × 10 = 40. Retirado: 60 − 40 = 20."),
  A(12, "Um preço sofreu dois aumentos sucessivos de 10%. Qual foi o aumento total?", ["20%", "21%", "22%", "25%"], 1, "1,10 × 1,10 = 1,21 → 21%. O segundo aumento incide sobre o preço já aumentado."),
  A(13, "Se hoje é quarta-feira, que dia da semana será daqui a 100 dias?", ["Quinta-feira", "Sexta-feira", "Sábado", "Domingo"], 1, "100 = 14 semanas + 2 dias. Quarta + 2 = sexta-feira."),
  A(14, "Um pai tem 40 anos e o filho, 10. Daqui a quantos anos a idade do pai será o dobro da idade do filho?", ["10", "15", "20", "30"], 2, "40 + x = 2(10 + x) → 40 + x = 20 + 2x → x = 20. Conferindo: 60 e 30."),
  A(15, "Numa corrida, você ultrapassa quem estava em segundo lugar. Em que posição você fica?", ["Primeiro", "Segundo", "Terceiro", "Depende do número de corredores"], 1, "Você assume a posição de quem ultrapassou: segundo. A intuição diz 'primeiro' — leia o que o problema afirma, não o que ele sugere."),
  A(16, "Três amigos dividem uma conta de R$ 210 de forma que o segundo paga o dobro do primeiro e o terceiro paga o triplo do primeiro. Quanto paga o terceiro?", ["R$ 35", "R$ 70", "R$ 105", "R$ 140"], 2, "x + 2x + 3x = 6x = 210 → x = 35; o terceiro paga 3 × 35 = 105."),
  A(17, "Um livro tem 300 páginas. Já li 40% e leio 15 páginas por dia. Em quantos dias termino?", ["10", "12", "14", "18"], 1, "Faltam 60% de 300 = 180 páginas; 180 ÷ 15 = 12 dias."),
  A(18, "Uma torneira pinga 1 gota a cada 2 segundos. Se 20 gotas fazem 1 mL, quantos mL pingam em 1 hora?", ["45", "60", "90", "120"], 2, "1 h = 3600 s → 1800 gotas → 1800 ÷ 20 = 90 mL."),
];

// ---------------------------------------------------------------------------
// Absurdos verbais / raciocínio verbal (SB5 Raciocínio Fluido — Absurdos)
// ---------------------------------------------------------------------------
const B = T("ab");
export const ABSURDOS: ItemTexto[] = [
  B(1, "\"A bibliotecária pediu silêncio absoluto e ligou o rádio no volume máximo para todos ouvirem melhor.\" Qual é o absurdo?", ["Bibliotecas não têm rádio", "Pedir silêncio e produzir barulho se contradizem", "Rádio não melhora a audição", "Não há absurdo"], 1, "A ação contradiz o pedido: quem exige silêncio não pode ser a fonte do barulho. Absurdos verbais testam se você localiza a contradição lógica, não um detalhe factual."),
  B(2, "\"Meu guarda-chuva é tão bom que, quando chove, deixo-o em casa para não molhá-lo.\" Qual é o absurdo?", ["Guarda-chuvas bons não molham", "Proteger o objeto do uso anula a função dele", "Chuva não molha guarda-chuvas", "Não há absurdo"], 1, "A função do guarda-chuva é ser molhado no seu lugar. Poupá-lo da chuva é inverter meio e fim."),
  B(3, "\"Guardo a foto do meu bisavô sorrindo para a câmera no dia em que nasceu, em 1830.\" Qual é o absurdo?", ["Bisavós não podem ter nascido em 1830", "Recém-nascidos não posam sorrindo, e fotografia em 1830 é anacrônica", "Fotos antigas não se conservam", "Não há absurdo"], 1, "Dois problemas: um recém-nascido não sorri para a câmera; e a fotografia só surge por volta de 1839. O item pede o absurdo central, não a data em si."),
  B(4, "\"Para economizar, dirigi 40 km a mais até um posto onde o litro era 2 centavos mais barato e abasteci 40 litros.\" Qual é o absurdo?", ["Postos distantes são sempre mais caros", "O custo do desvio (combustível e tempo) supera a economia de R$ 0,80", "Não se pode abastecer 40 litros", "Não há absurdo"], 1, "Economia: 40 × 0,02 = R$ 0,80. Os 40 km extras custam muito mais que isso. O absurdo é a comparação de grandezas."),
  B(5, "O aviso na porta dizia: \"Se você não sabe ler, peça ajuda para ler este aviso.\" Qual é o absurdo?", ["Avisos não devem ficar em portas", "Quem não sabe ler não consegue ler a instrução dirigida a ele", "Pedir ajuda é constrangedor", "Não há absurdo"], 1, "A mensagem só alcança quem já sabe ler — exatamente quem não precisa dela. Autorreferência que anula o propósito."),
  B(6, "\"A previsão garantiu 100% de chance de chuva ou de sol amanhã.\" Qual é o absurdo?", ["Previsões nunca chegam a 100%", "A afirmação cobre todas as possibilidades e por isso não informa nada", "Chuva e sol não podem ocorrer no mesmo dia", "Não há absurdo"], 1, "Uma previsão que inclui todos os resultados possíveis é uma tautologia: não pode errar porque não diz nada."),
  B(7, "\"Ele contou que foi o único sobrevivente do naufrágio em que morreram todos os passageiros, inclusive ele.\" Qual é o absurdo?", ["Naufrágios sempre têm sobreviventes", "Ser o único sobrevivente e ter morrido é contraditório", "Passageiros não contam histórias", "Não há absurdo"], 1, "Contradição direta entre 'sobreviveu' e 'morreu'."),
  B(8, "\"Para motivar a equipe, o gerente prometeu que todos os funcionários passariam a ganhar acima da média salarial da empresa.\" Qual é o absurdo?", ["É possível se a empresa lucrar mais", "Nem todos podem estar acima da média do próprio grupo", "Salários não têm média", "Não há absurdo"], 1, "A média é calculada a partir dos próprios salários: se todos subissem, a média subiria junto. Alguém sempre fica na média ou abaixo."),
  B(9, "\"O museu proibiu fotos com flash para proteger as pinturas e instalou holofotes potentes sobre elas o dia todo.\" Qual é o absurdo?", ["Museus não usam holofotes", "Proibir o flash e expor as obras a luz forte contínua é incoerente", "Fotos com flash são melhores", "Não há absurdo"], 1, "Se a preocupação é a luz sobre a tinta, holofotes contínuos agridem mais do que flashes ocasionais. A regra contradiz a justificativa."),
  B(10, "\"Nesta cidade, 80% dos motoristas se consideram entre os 50% melhores ao volante.\" O que essa frase revela?", ["Que a cidade tem ótimos motoristas", "Que a maioria se avalia de forma inflada: só metade pode estar entre os 50% melhores", "Que a média é alta", "Nada de estranho"], 1, "Autoavaliação, não desempenho: por definição, no máximo 50% ficam entre os 50% melhores. (Com 'acima da média' seria possível, se a distribuição fosse assimétrica; por isso o item fala em metade.)"),
];

// ---------------------------------------------------------------------------
// Conhecimento geral (WAIS-IV Informação / SB5 Conhecimento)
// ---------------------------------------------------------------------------
const C = T("co");
export const CONHECIMENTO: ItemTexto[] = [
  C(1, "Qual é o maior planeta do Sistema Solar?", ["Saturno", "Júpiter", "Netuno", "Urano"], 1, "Júpiter: cerca de 11 vezes o diâmetro da Terra e mais massa que todos os outros planetas juntos."),
  C(2, "Quantos ossos tem, aproximadamente, o corpo humano adulto?", ["106", "206", "306", "406"], 1, "206. Bebês nascem com cerca de 270 peças ósseas, que se fundem ao longo do crescimento."),
  C(3, "Quem escreveu 'Dom Casmurro'?", ["José de Alencar", "Machado de Assis", "Graciliano Ramos", "Lima Barreto"], 1, "Machado de Assis, 1899. Bentinho, Capitu e a dúvida que atravessa o romance."),
  C(4, "Qual é o gás mais abundante na atmosfera da Terra?", ["Oxigênio", "Gás carbônico", "Nitrogênio", "Hidrogênio"], 2, "Nitrogênio, cerca de 78%. O oxigênio fica em torno de 21%."),
  C(5, "Em que século ocorreu a Revolução Francesa?", ["XVI", "XVII", "XVIII", "XIX"], 2, "1789 pertence ao século XVIII (1701–1800). Erro comum: associar '17' ao século XVII."),
  C(6, "Qual é a capital da Austrália?", ["Sydney", "Melbourne", "Camberra", "Perth"], 2, "Camberra, cidade planejada para ser a capital, escolhida como solução de compromisso entre Sydney e Melbourne."),
  C(7, "Quantos lados tem um heptágono?", ["5", "6", "7", "8"], 2, "Hepta = sete (grego). Penta 5, hexa 6, hepta 7, octo 8."),
  C(8, "Qual órgão produz a insulina?", ["Fígado", "Pâncreas", "Rim", "Baço"], 1, "O pâncreas, nas ilhotas de Langerhans. A insulina permite que a glicose entre nas células."),
  C(9, "Quem formulou a teoria da relatividade geral?", ["Isaac Newton", "Niels Bohr", "Albert Einstein", "Max Planck"], 2, "Einstein, 1915: a gravidade como curvatura do espaço-tempo."),
  C(10, "Qual é o maior oceano do planeta?", ["Atlântico", "Índico", "Pacífico", "Ártico"], 2, "O Pacífico cobre cerca de um terço da superfície da Terra — mais que toda a área continental."),
  C(11, "A que temperatura a água pura ferve ao nível do mar?", ["90 °C", "100 °C", "110 °C", "120 °C"], 1, "100 °C a 1 atm. Em altitude, a pressão menor faz a água ferver antes."),
  C(12, "Qual é a unidade básica da hereditariedade?", ["Célula", "Proteína", "Gene", "Cromossomo"], 2, "O gene: trecho de DNA que codifica uma característica. Cromossomos são os pacotes que contêm muitos genes."),
];

// ---------------------------------------------------------------------------
// Visuoespacial em texto (SB5 Processamento Visuoespacial — posição e direção)
// ---------------------------------------------------------------------------
const E = T("es");
export const ESPACIAL: ItemTexto[] = [
  E(1, "Você está de frente para o norte e gira 270° no sentido horário. Para onde fica de frente?", ["Leste", "Oeste", "Sul", "Norte"], 1, "Horário: norte → leste (90°) → sul (180°) → oeste (270°). Atalho: 270° horário = 90° anti-horário."),
  E(2, "Um cubo 3×3×3 pintado por fora é cortado em 27 cubinhos iguais. Quantos cubinhos têm exatamente duas faces pintadas?", ["6", "8", "12", "24"], 2, "Um por aresta, no meio de cada uma: o cubo tem 12 arestas → 12. Os 8 vértices têm 3 faces; os 6 centros de face têm 1; o do meio, nenhuma."),
  E(3, "Qual é o menor ângulo entre os ponteiros de um relógio às 3h30?", ["60°", "75°", "90°", "105°"], 1, "Minutos em 6 → 180°. Horas: 3,5 × 30° = 105°. Diferença: 75°. O ponteiro das horas anda meio caminho entre 3 e 4."),
  E(4, "Dobre uma folha ao meio, depois ao meio de novo, e faça um furo atravessando todas as camadas, longe das dobras. Quantos furos há ao desdobrar?", ["1", "2", "4", "8"], 2, "Duas dobras = 4 camadas; o furo atravessa todas: 4 furos (um furo sobre a dobra seria compartilhado e daria menos)."),
  E(5, "Você caminha 3 km para o norte e depois 4 km para o leste. A que distância em linha reta está do ponto de partida?", ["5 km", "6 km", "7 km", "3,5 km"], 0, "Triângulo retângulo 3-4-5: √(9 + 16) = 5 km."),
  E(6, "Num mapa, o leste fica à direita. Se você está de frente para o sul, o leste fica…", ["à sua direita", "à sua esquerda", "atrás de você", "à sua frente"], 1, "De frente para o sul, a orientação se inverte: o leste passa para a esquerda e o oeste para a direita."),
  E(7, "No espelho, os ponteiros de um relógio parecem marcar 4h20. Que horas são de verdade?", ["7h40", "8h20", "4h40", "6h40"], 0, "A imagem espelhada reflete em torno do eixo 12–6: hora real = 12h − hora vista. 12h00 − 4h20 = 7h40."),
  E(8, "Um quadrado de papel é dobrado pela diagonal e, em seguida, o triângulo obtido é dobrado ao meio. Que figura resulta?", ["Um quadrado menor", "Um triângulo menor", "Um retângulo", "Um losango"], 1, "A diagonal produz um triângulo retângulo isósceles; dobrá-lo ao meio (pela altura) dá outro triângulo retângulo isósceles, com metade da área."),
  E(9, "Olhando de cima, um carro vai para o norte e vira à esquerda, depois à esquerda de novo e depois à direita. Para onde ele vai agora?", ["Norte", "Sul", "Leste", "Oeste"], 3, "Norte → esquerda = oeste → esquerda = sul → direita = oeste."),
  E(10, "Quantos cubinhos são necessários para completar um cubo 4×4×4 se já existem 37 no lugar?", ["27", "23", "31", "19"], 0, "4 × 4 × 4 = 64 cubinhos no total; 64 − 37 = 27 faltando."),
];

export const BANCOS_TEXTO = { ARITMETICA, ABSURDOS, CONHECIMENTO, ESPACIAL };
