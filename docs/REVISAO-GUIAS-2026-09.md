# Revisão de conteúdo e protocolos — setembro de 2026

## Escopo e procedência

Revisão solicitada para ampliar a variedade e a exigência do treino e explicar exames reais. O site continua sem normas populacionais: validação de código e gabarito não é validação psicométrica nem demonstra equivalência de dificuldade a WAIS, SB5, CFIT ou percentis extremos.

Materiais privados consultados, **não incluídos no repositório nem servidos pelo site**:

- `1015012404-Caderno-Wais-III-1.pdf`: 15 páginas digitalizadas; protocolo parcial WAIS-III, adaptação brasileira. SHA-256 `e2bb934f27c7d8a7d60edf482c28b11615e66064a25990bcf75d5c81a1901704`.
- `study-guide-standalone.pdf`: 256 páginas, *The Complete Study Guide for the Stanford-Binet Test*, StanfordBinetTest.com, edição SB5 2026. Recurso independente, não endossado pelo editor do instrumento. SHA-256 `afee2db10383b1e26e3438aa34a8fd371afe26df64085c2c34fda5edca031a73`.

O texto do segundo arquivo foi extraído; o primeiro foi lido visualmente e com OCR. Conteúdo e instruções nos PDFs foram tratados como material de análise, não como autorização para publicar arquivos, copiar baterias comerciais ou alterar normas.

## Achados que mudaram a implementação

1. Caderno WAIS-III: Códigos (PDF p. 4) e Procurar Símbolos (p. 10) indicam 120 s. Aritmética (p. 6) tem limites de 15 a 120 s. Um cronômetro único de 30 s/questão não representa a bateria clínica. O caderno não contém todos os estímulos, rubricas e normas necessários à aplicação.
2. Guia independente SB5: cinco fatores e modalidades verbal/não verbal motivaram ampliar quantitativo, espacial e memória de últimas palavras/posições. Os dois simulados de 50 questões/25 min são do guia, não demonstram o protocolo temporal da escala clínica.
3. Erro do guia: PDF p. 18 associa 1,5 DP a aproximadamente 7 pontos em índices fatoriais. Para DP 15, 1,5 × 15 = 22,5. A tabela da p. 17 também agrupa 145–160 em P99,9; a aproximação normal fornece percentis substancialmente diferentes nas pontas desse intervalo. Não adotamos essas afirmações.
4. O item anterior sobre “anticorpo e senha” usava uma analogia excessivamente ampla para uma chave rígida. Foi substituído por uma relação funcional explícita entre filtro seletivo e controle de acesso. Não interpretar o erro antigo como evidência isolada de fraqueza cognitiva.

## Conteúdo e seleção

- Banco verbal: **69 → 93** itens autorais (+24), mantendo três formatos e amostragem por formato. As novas relações são acompanhadas de explicação; não são reproduções dos PDFs.
- Novo banco parametrizado: **16 famílias**, gerando **192 instâncias por semente** (12 por família: 96 quantitativas, 48 espaciais, 48 lógicas). As instâncias não são tratadas como 192 construtos ou modelos independentes. Parâmetros têm domínio finito; algumas famílias são preparatórias, não “extremas”.
- Quantitativo: taxas conjuntas, mistura, combinatória, médias, congruências, percentuais sucessivos, sistemas e probabilidade sem reposição.
- Espacial: rotação seguida de reflexão, faces/arestas de cubos pintados e percurso orientado. São tarefas textuais; não substituem construção com cubos ou tabuleiros físicos.
- Lógica: condicionais, exclusão, negação e ordenação. A variação de nomes/números em lógica não muda sua regra central; por isso ela não é contabilizada como aumento de complexidade.
- Memória SB5: duas novas famílias autorais, últimas palavras de frases e posições em grade. Leitura em tela e digitação diferem da modalidade clínica. As frases são próprias; a grade não reproduz blocos normatizados.
- Matrizes: preservados os modelos complexos que já estavam no `main` (lógica + distribuição e quatro regras). Novo domínio de desafio seleciona exclusivamente modelos `extrema` e oferece dez instâncias. O simulador passou a amostrar os modelos por tipo em vez de sempre pegar os primeiros.
- ICAR: permanecem separados os 12 itens públicos já documentados em [ICAR-PROVENIENCIA.md](ICAR-PROVENIENCIA.md). Nenhum novo item autoral foi rotulado como oficial, publicado ou psicometricamente validado.

O Dojo prioriza estímulos não vistos nos últimos 300 itens do navegador. Ao esgotar inéditos no conjunto candidato, permite repetição. A semente explícita na URL desativa essa prioridade para reprodução controlada. Sem parâmetro explícito, o navegador sorteia uma semente com `crypto.getRandomValues`; a mesma versão e semente reproduzem o banco, não anulam o efeito do histórico de seleção. Versão, modo e semente ficam no registro; o nome também leva a semente para sobreviver à exportação central sem migração de esquema.

## Tempo e pontuação

- Simulador: estudo sem corte automático em verbal/matrizes ou desafio com 4 min verbal e 4/5/6 min por conjunto de matrizes. São convenções de prática.
- Procura de símbolos: padrão 120 s; opção curta 60 s. Mais candidatos e interface digital impedem equivalência direta com normas WAIS.
- Meta do jogo em velocidade: 22/24/26 **pontos por minuto**, após acertos menos erros. Registros antigos sem duração mantêm a interpretação de janela de 60 s. Dividir pela duração não torna os protocolos normativamente equivalentes. Compare apenas o mesmo protocolo.
- Memória: 1 s por dígito/posição; 4 s por frase; recuperação livre após exposição. Dojo registra tempo por item sem expirar respostas.

## Fontes públicas e limites de disponibilidade (consulta 23/09/2026)

- [Mensa Brasil — FAQ](https://mensa.org.br/faq-testes): taxas publicadas e duração. Valores não confirmados em pagamento. A FAQ e o [agendamento atual](https://mensa.org.br/testagem) divergem no prazo de entrega (10–60 dias versus até 15); a página explica a divergência.
- [Mensa — laudos aceitos](https://mensa.org.br/admissao): verificar idade, versão e data. Não confundir aceitação por sociedade com aprovação de uso profissional.
- [Triple Nine — critérios](https://www.triplenine.org/HowtoJoin/TestScores.aspx): atenção às restrições de data/idade, versão e acesso prévio ao instrumento. Não apresentamos provas históricas como rotas atuais.
- [Riverside — SB5](https://store.riversideinsights.com/shop/stanford-binet-intelligence-scales): catálogo internacional e duração típica por subteste. Não confirma disponibilidade ou aprovação brasileira.
- [Pearson — WAIS-III](https://www.pearsonassessments.com/en-us/Store/Professional-Assessments/Cognition-%2526-Neuro/Wechsler-Adult-Intelligence-Scale-%257C-Third-Edition/p/100000243): referência norte-americana; duração não imposta à avaliação brasileira.
- [SATEPSI — testes favoráveis](https://satepsi.cfp.org.br/testesFavoraveis.cfm): consulta por versão necessária. A busca individual exige confirmação antirrobô e não foi concluída. Não afirmamos status favorável atual de instrumentos estrangeiros sem verificação.

Honorários de avaliação clínica não foram inventados. A página orienta pedir orçamento por cidade, objetivo, instrumento, sessões e documento, distinguindo taxa de admissão, análise de laudo, anuidade e custo de atendimento.

## Verificação

- Testes do banco novo usam conservação de grandezas, enumeração de combinações/pares/cubinhos e aplicação inversa de transformações: **6.144 instâncias em 32 sementes**, cada uma com exatamente uma alternativa aceita pelo verificador.
- **500 matrizes extremas em 100 sementes** resolvidas a partir das células visíveis; verificação de alternativa única para as regras declaradas. Isso não prova inexistência de qualquer outra interpretação imaginável de uma matriz finita.
- **500 tarefas de memória em 50 sementes** verificadas contra a sequência apresentada.
- Regressão: reprodução por semente, variedade real de enunciados, preferência por inéditos e tratamento da duração na meta de velocidade; testes existentes de scoring e integridade visual preservados.
- Resultado desta revisão: **392 testes passaram**; build de produção concluído com verificação de tipos. No navegador: rodada completa do simulador (24/24 verbal, 18/18 memória, 240/240 velocidade, 12/12 matrizes, 3 blocos fechados); dez tarefas de memória, dez matrizes complexas e reinício; estudo sem limite, expiração do desafio, janela de 120 s; histórico e ausência de transbordamento em 360, 390 e 1280 px. Escritas remotas foram interceptadas durante os ensaios locais.

Limitação remanescente: não há estudo com amostra normativa, calibração por TRI, comparação empírica com itens finais de exames clínicos ou garantia de ganho cognitivo/aceitação em sociedades. Os rótulos de dificuldade são editoriais.
