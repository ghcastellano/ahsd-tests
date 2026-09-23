# Preparação Mensa Brasil — auditoria de 23/09/2026

## Conclusão

A fonte oficial sustenta admissão não verbal/culture fair, instrumentos sorteados no dia, até 60 minutos, equivalência entre coletivo e individual e requisito p98. Não foi localizada relação oficial atual dos instrumentos sorteados. Não atribuir probabilidades ao conteúdo nem converter acertos deste treino em percentil.

O texto anexado pelo usuário é uma hipótese de preparação parcialmente bem fundamentada. A lista APM/RAPM-II, D48/D70, G36/G38, R1, Clocks e TIG-NV consta de comentário de março de 2023, não de relatório verificado de aplicação brasileira em 2026. Atribuir “alta confiança” à incidência de Raven ou “70–90%” de cobertura não é sustentado pelas fontes encontradas. Tempos de catálogos dependem da edição/protocolo e não estabelecem a aplicação da Mensa. A restrição de alternativas clínicas adultas apenas a WAIS/WASI também é excessiva: examinar a versão/faixa etária de SON-R e a lista oficial.

## Busca de relatos

Consultas públicas em português e inglês com nomes de instrumentos, “Mensa Brasil”, “Mensa Brazil”, “fiz”, “teste”, “relato”, meses de junho a outubro e ano 2026; busca direcionada a Reddit e comunidades, seguida de leitura das páginas. Exemplos de consultas:

- `"Mensa" "fiz" "2026" "setembro" teste Brasil`
- `"Mensa" "teste" "2026" "junho" relato`
- `"Mensa Brasil" "2026" "agosto" experiência prova`
- `"Mensa Brasil" "2026" "julho" Raven`

Critérios: primeira pessoa, país brasileiro, data da aplicação (não apenas postagem) e instrumento/formato identificável. Nenhum relato localizado de junho, julho, agosto ou setembro até dia 23 satisfez todos os critérios. Isso não demonstra inexistência: grupos privados, material não indexado e identidade dos autores não foram verificáveis. Outubro ainda é futuro; agendas não são relatos retrospectivos. Não houve acesso a grupos privados/deepweb nem alegação de tal acesso.

Fontes e exclusões:

- https://mensa.org.br/faq-testes — fonte primária das regras gerais; não lista instrumentos. A associação diz que não é necessária preparação.
- https://mensa.org.br/testagem — fonte primária de agendamento, descrição não verbal. Reconfirmar logística com a associação; FAQ e agendamento podem divergir em taxas/prazo de resultado.
- https://mensa.org.br/admissao — via alternativa de laudos e restrições; não confundir com instrumentos da admissão presencial.
- https://www.reddit.com/r/cognitiveTesting/comments/11ku55q/mensa_admission_tests/ — março/2023; lista comunitária, sem prova de pool vigente.
- https://www.reddit.com/r/cognitiveTesting/comments/1nh2qcp/ — setembro/2025; pergunta sobre teste brasileiro, fora do período e sem aplicação atual demonstrada.
- https://www.reddit.com/r/mensa/comments/1ustnv5/just_got_in/ e https://www.reddit.com/r/mensa/comments/1vohrux/got_admitted/ — relatos encontrados na busca de 2026, mas o texto consultado não identifica aplicação brasileira e instrumento. A data indexada ou relativa não basta para determinar data/local do teste. Referências à Mensa americana em comentários não identificam o país do autor.
- https://evento.mensa.org.br/eventos/santos-2026/ — agenda de junho; não identifica instrumento. Janela 9h–12h30 não é duração individual da prova.
- https://www.us.mensa.org/featured-content/changes-to-american-mensas-admission-test-course/ — comunicado nacional americano de 21/02/2022 sobre RAIT/Wonderlic; não extrapolar para Brasil.
- https://www.vetoreditora.com.br/produto/g-36-livro-de-exercicio-70897 — descrição comercial primária e estimativa de 30min para G36; não comprova uso Mensa.

## Implementação inicial — mensa-br-1

- Rota `/treino/mensa`, acessível na home, bateria, Dojo Mensa, treino de matrizes e guia de exames.
- Principal: 24 itens, 30min corridos. 12 matrizes (7 difíceis + 5 extremas do banco existente), 6 séries, 6 classificações. Ordem editorial de estudo, não ordem conhecida da prova.
- Complemento: 12 itens, 12min. Novos geradores autorais: 6 dominós com relações independentes por metade em ciclo 0–6; 6 mostradores com deslocamentos e aceleração de dois ponteiros independentes. Não são cópias de D48/D70/Clocks, nem calibrados contra esses instrumentos.
- Mesmas famílias de regras podem repetir. Semente reproduz estímulos/opções; nova semente varia parâmetros e seleção, sem promessa de independência psicométrica ou de nunca repetir item. Versão e semente registradas no nome persistido.
- Sem corte por item; cronômetro baseado em prazo absoluto, incluindo tempo com aba oculta. Gabarito só após término; navegar, pular, limpar e marcar. Confirmação de término antecipado. Respostas após prazo são rejeitadas. Tempo por item inclui permanência com aba oculta; não mede somente atenção ativa.
- Resultado com acertos, erros, omissões, domínios, revisão e tempo por item, histórico local e integração existente de envio central. Sem faixa normativa/predição de aprovação. Recarregar perde sessão em andamento, informado antes de começar.
- Gabaritos novos verificados por inferência independente das relações nos estímulos visíveis, 400 sementes × 12 itens; alternativas deduplicadas, renderização sem célula-resposta, composição, sorteio, pontuação e expiração cobertos.

Não publicar o texto de materiais comerciais ou itens sigilosos como se fossem um banco autorizado. A senha do site não muda proveniência, validade ou representatividade dos itens.

## Validação da entrega inicial

- `npm test`: 397 testes aprovados (23 arquivos), incluindo os cinco testes novos do módulo e 4.800 itens complementares em 400 sementes.
- `npm run build`: compilação, tipos e geração de 48 rotas concluídos.
- Navegador: principal 24/24 e complemento 12/12 na semente 42, conferidos com histórico e revisão; nova sessão troca semente; voltar preserva resposta; limpar a remove; marcar para rever funciona.
- Expiração simulada: complemento encerrou aos 720s com 1 acerto, 1 erro e 10 omissões, preservando respostas já dadas. Fluxos executados com gravação remota interceptada para não poluir dados reais.
- Layout inspecionado em desktop e celular (390px e 360px), incluindo figuras e revisão, sem rolagem horizontal da página. Os testes lógicos não constituem validação psicométrica.


## Revisão de dificuldade — mensa-br-2

Implementação autorizada após o code review. Foco na preparação brasileira não verbal; a pesquisa estrangeira/comunitária não estabelece o conteúdo da admissão do Brasil.

### Mudanças

- Novo **Desafio avançado**: 24 itens, 40 minutos editoriais na sessão cronometrada. Doze matrizes de transformação espacial + operação lógica (por linha ou coluna), seis séries com transformações alternadas/intercaladas e seis classificações por relação entre pares. Quatro famílias estruturais, com rotações/reflexões, operações e estímulos sorteados. Variações paramétricas não são novas famílias nem provas psicometricamente independentes.
- Geração rejeita respostas divergentes dentro de uma gramática explícita: oito transformações espaciais e três operações para matrizes, duas formas de sequenciar transformações para séries, transformações com/sem inversão preto/branco para classificação. A célula oculta não é usada na inferência. Há segundo solucionador com conjuntos/coordenadas nos testes; não importa o transformador nem a operação do gerador.
- Alternativas de mosaicos em três pares complementares: cada posição preta aparece três vezes entre seis alternativas. Classificação mantém a quantidade de pretos em cada lado dos seis pares, exigindo comparar a relação espacial.
- Dominós incluem troca das metades antes de somar/subtrair em ciclo 0–6; mostradores incluem trocas de papel dos ponteiros antes dos deslocamentos/acelerações. As alternativas usam produtos 2×3 ou 3×2, removendo o atalho de frequência dos componentes. Relações alternativas com respostas divergentes são rejeitadas.
- Matrizes existentes com componentes usam alternativas equilibradas. Um distrator pode copiar uma célula visível: eliminar isso sistematicamente não é uma condição de validade e interferia no equilíbrio. A antiga promessa de que cada distrator viola exatamente uma regra foi retirada.
- Preenchimento externo cinza preserva contraste das marcas pretas internas, inclusive em figuras totalmente preenchidas.
- Preparação principal mantém 24 itens e 30 minutos, com deduplicação e reposição por domínio/dificuldade. Complemento mantém 12 itens e 12 minutos. Dojo agora deduplica estímulos entre domínios, incluindo a regressão da semente 14. Classificações normalizam a ordem do conjunto para detectar repetição do mesmo problema.
- Estudo sem limite (padrão), com hipótese escrita opcional antes de revelar alternativas. Classificação mostra as opções desde o início, pois são o próprio enunciado. Gabaritos somente na revisão final nos dois regimes. Estudos longos não são encerrados nem têm a duração cortada pelo limite do modo cronometrado.
- Histórico registra versão, semente, regime, tempos por item e hipóteses. Exposição local acompanha os últimos 2.000 estímulos efetivamente apresentados na sessão ou abertos na revisão. Não trata erro de armazenamento como prova de ineditismo. Figuras diferentes com a mesma regra continuam podendo aparecer. Dados anteriores à versão 2 ou de outro dispositivo não permitem identificar primeira exposição.
- Ao navegar entre itens, a tela volta ao enunciado. Revisão e alternativas de pares têm duas colunas em celular, evitando comprimir os mosaicos.
- Corrigida analogia MINUTO:HORA :: CENTÍMETRO:METRO: “Quilômetro” também atendia à relação declarada e foi substituído por “Litro”.

### Validação

- Suíte completa: 405 testes em 25 arquivos.
- Solucionador independente: 2.880 itens do desafio em 120 sementes e 4.800 itens complementares em 400 sementes.
- Regressão do atalho da moda: 12.000 itens complementares; equilíbrio de atributos das matrizes existentes em 200 sementes.
- Duplicatas: regressão do Dojo seed 14 e sementes de 0 a 79; três bancos Mensa em 50 sementes, com verificação de reprodução e variação.
- TypeScript sem emissão e build de produção das 48 rotas.
- Navegador: gabaritos completos 24/24 no desafio, 24/24 no principal, 12/12 no complemento; limpar, voltar, pular, marcar, revisão e hipótese; Dojo completo na semente 14. Armazenamento e requisições remotas de teste isolados dos registros reais.
- Tempo: estudo permaneceu aberto após 45 minutos simulados e guardou a duração integral. Desafio cronometrado expirou exatamente aos 2.400s com 1 acerto e 23 omissões. Repetir a semente reconheceu os estímulos vistos.
- Inspeção visual em desktop 1280px e celular 360px, com matrizes, pares e revisão sem rolagem horizontal.

### Limites

Esta é validação lógica e de software, não calibração psicométrica. As regras enumeradas não cobrem toda interpretação imaginável. Não há amostra normativa, medida de discriminação, equivalência com Mensa Brasil, previsão de aprovação ou conversão em QI/percentil. O histórico individual permite comparar treino, mas não substitui estudo empírico com participantes. A página explica esses limites e os tempos editoriais.
