# Questões públicas ICAR — proveniência e revisão

Consultado em 12/09/2026. Autores: David M. Condon e William Revelle (2014).

- [Suplemento original da editora](https://ars.els-cdn.com/content/image/1-s2.0-S0160289614000051-mmc1.pdf), Apêndice A, páginas 2–4. PDF obtido diretamente, 556.736 bytes, 19 páginas.
- [Artigo na página do autor](https://personality-project.org/revelle/publications/condon.icar.14.pdf).
- [Declaração de domínio público](https://www.icar-project.org/).
- [Chave independente e ordem dos itens](https://personality-project.org/r/psych/help/iqitems.html), exemplo `iq.keys` do psychTools.

SHA-256 do PDF: `ddd8352e4c07a693f4b9329699f1cf21b7c87ddc55b4abd816716c8c51e48b0a`.

O link antigo no domínio icar-project.com retornou 404. A fonte final usada foi o suplemento da editora acima; o texto e as páginas foram conferidos visualmente. As figuras são os JPEGs originais embutidos nas páginas 3–4, extraídos por `pdfimages -j`, sem redesenho, recorte ou mudança de alternativas.

| ID no suplemento | ID na chave | Página | Gabarito (base 1) | Verificação adicional |
|---|---|---:|---|---|
| VR.4 | reason.4 | 2 | 4 — 5 | 900/(9×4×5) |
| VR.16 | reason.16 | 2 | 4 — indeterminado | Contraexemplos para as três relações de altura |
| VR.17 | reason.17 | 2 | 4 — 47 | Diferença constante de 24 anos |
| VR.19 | reason.19 | 2 | 6 — domingo | Enumeração dos sete dias |
| LN.7 | letter.7 | 2 | 6 — X | Saltos +3,+2 alternados |
| LN.33 | letter.33 | 2 | 3 — G | Saltos −5,−4,−3,−2,−1 |
| LN.34 | letter.34 | 2 | 4 — X | Saltos +1,+2,+3,+4,+5 |
| LN.58 | letter.58 | 2 | 4 — N | Saltos +2,−5,+2,−4,+2 |
| MX.45 | matrix.45 | 3 | 5 — E | Losango preto em cima; estrela à direita |
| MX.46 | matrix.46 | 3 | 2 — B | Losango preto à esquerda; quadrado acima |
| MX.47 | matrix.47 | 4 | 2 — B | Fundo branco; cruz preta; quadrado central branco |
| MX.55 | matrix.55 | 4 | 4 — D | Círculo preto em cima; triângulo à direita; seta à esquerda |

## Integridade das figuras

| Arquivo | SHA-256 |
|---|---|
| MX.45.jpg | d31727b203f262222f98af2a61bd99b75bd9f45db6e471c46eb22a57b343a6de |
| MX.46.jpg | 5f04a042cd9f1e780881777069e2874c8765333f56466b7475f9dfd49e26be40 |
| MX.47.jpg | e5ec633fe50b62177d73b570e2229905e6fd0448ddd9c1621ce9de5851e19c3e |
| MX.55.jpg | 43375716fb1e396745ffe415aa1e05424b1d140de1ecc0e1ecdd9d50391ea62f |

## Escopo da validade

Os 12 itens têm origem publicada e chave confrontada com outra publicação dos pesquisadores. A correspondência do gabarito é verificável; isso não implica normatização do módulo. As traduções e explicações são editoriais, sem validação transcultural. O usuário pode alternar para enunciados e alternativas originais em inglês. As séries finitas não têm continuação matematicamente única sem uma classe de regras; o aplicativo explica a regra convencional compatível com a chave publicada.

A seleção exclui os quatro itens de rotação 3D: é um subconjunto de 12 itens, não o ICAR-16 completo, nem uma forma equivalente, nem um instrumento de admissão. Não fornece QI ou percentis. Os blocos principais continuam sendo treino autoral, claramente identificado. Não foram incorporados itens comerciais, arquivos sem proveniência ou puzzles atribuídos à TNS sem acesso verificável.

## Controle de qualidade

- Chave e IDs confrontados nos testes automatizados.
- Frações, idade, dias da semana e séries resolvidos independentemente no teste.
- Matrizes conferidas visualmente no PDF e por decomposição das regras; suas explicações são editoriais.
- Figuras preservadas byte a byte e protegidas por hashes no teste.
- Correção apenas após finalizar, com itens em branco separados e repetição identificada como revisão.
- Correção da tarefa antiga de velocidade: equivalência por aparência, incluindo simetrias, barras rotacionadas e preenchimentos invisíveis; testes sobre 18.000 tentativas.

Testes de software não demonstram validade psicométrica. O banco autoral anterior não recebeu auditoria psicométrica completa nesta alteração.

Verificação final: 353 testes automatizados passaram; build de produção concluído.
No navegador: 12/12 com a chave, 0/12 com 12 itens em branco, bloqueio das respostas
após correção, reinício, troca para inglês, quatro imagens carregadas e ausência de
rolagem horizontal a 390 px. A inspeção visual confirmou leitura e ampliação das matrizes.

Reprodução do defeito anterior: revisão `9e8eda29ae8dc8400ab5a19e7b38fd72e093b065`,
semente 0, nível 3, tentativa 7. O alvo `slash` girado 180° coincide com o candidato
`backslash` girado 90°; o preenchimento é invisível nas linhas. O gabarito anterior
era `false` apesar de haver correspondência visual. Isso demonstra o defeito do
programa, não quantifica o efeito sobre uma tentativa pessoal cujos estímulos não foram preservados.
