# Registo de Alterações

Histórico de versões, em linguagem simples. Cada entrada explica o que mudou e porquê, em no máximo 2 linhas.

## 2026-09-22 — PR #118
Corrigido: no Gerador de Layout de ULDs, o menu "Add ULD group" mostrava sempre os mesmos IATA de exemplo (ex. "LD2 (AKH / DPE)") em vez dos que tu realmente adicionaste ao catálogo — o LD8 nem sequer tinha exemplo e aparecia sem nada. Agora mostra sempre os IATA reais do teu catálogo.

## 2026-09-21 — PR #117
Corrigido: no Gerador de Layout de ULDs, a explicação da opção "Combine ULDs certified for the same position" dizia sempre que os tipos se iam combinar — mesmo quando nenhum tipo partilhava a mesma estação/índice/peso máximo e por isso nada se ia combinar de facto. Agora avisa quando não há nada para combinar.

## 2026-09-21 — PR #116
Corrigido: na vista de zonas do Gerador de Layout de ULDs, posições L/R com "P" no nome (ex. `11PL`/`11PR`, usado no LD8/DQF) apareciam como se não existissem — a célula ficava vazia mesmo com a posição criada e pronta a exportar. Agora mostra a posição certa em qualquer tipo de nome.

## 2026-09-21 — PR #115
Corrigido: no Gerador de Layout de ULDs, a opção "+ L/R pair" só aparecia para LD3/LD2 — tipos como o LD8 (DQF/FQA), que também podem ser carregados em par L/R consoante a aeronave, obrigavam a criar as posições à mão e davam erro de índice inválido. Agora a opção está disponível para todos os tipos de ULD.

## 2026-09-14 — PR #114
Removidos os botões de exportar em CSV no Gerador de Layout de ULDs: o ficheiro `.csv` abria mal no Excel (tudo numa coluna só, por causa das definições regionais) e também é usado para upload — para evitar confusão e uploads falhados, só fica o Excel (`.xlsx`), que já funciona bem nos dois casos.

## 2026-09-14 — PR #113
Corrigido: no Gerador de Layout de ULDs, na vista de zonas, os nomes dos tipos de ULD ficavam sobrepostos quando o nome era comprido (ex.: aeronaves com muitos tipos certificados na mesma posição).

## 2026-09-14 — PR #111
Corrigido: apelidos compostos (ex.: "AL KARAD", "DA SILVA") numa associação a passageiro eram acusados como "hífen solto" mesmo estando corretos.

## 2026-09-14 — PR #109
Corrigido: quando uma remark (ex.: `.R/CHKD`) tinha uma associação a um passageiro errado (nome trocado), isso não era detetado — só acontecia essa verificação para o `.R/DOCS`. Agora aplica-se a qualquer remark.

## 2026-09-14 — PR #107
Corrigido: não era possível colar texto no Message Validator quando a mensagem estava vazia ou acabada de limpar — clicar na caixa não fazia nada porque não havia ali um alvo clicável.

## 2026-09-11 — PR #104
A ferramenta "Airline Message Toolkit" passou a chamar-se "Message Parser/Builder", o mesmo nome usado na ferramenta original em que foi baseada.

## 2026-09-11 — PR #103
Corrigido um bug de layout real: quando o resultado tinha muitas colunas (ex.: um PRL grande), a caixa de entrada ficava esmagada numa faixa fina em vez de manter metade do espaço.

## 2026-09-11 — PR #101
No tema claro, os títulos pequenos (ex.: "1. FLIGHT AND PASSENGER DATA", "AIRLINE *") estavam quase ilegíveis — a cor ficou mais escura em todas as ferramentas. O tema escuro não mudou.

## 2026-09-11 — PR #99
Corrigido: um ficheiro exportado do PRL Parser não conseguia ser carregado no PNL Builder para gerar o PNL (dava erro de "colunas em falta"). Agora funciona diretamente, sem precisar de renomear nada.

## 2026-09-11 — PR #97
No Secure ZIP, qualquer ficheiro `.csv` anexado passa a vir convertido para `.xlsx` corretamente formatado (colunas separadas, datas e números reais nas colunas certas) antes de ser encriptado.

## 2026-09-11 — PR #93 e #95
No Message Validator, a mensagem e o resultado passaram a ficar lado a lado, e agora dá para selecionar com o rato várias linhas ou a mensagem toda de uma vez — antes a seleção ficava presa a uma linha.

## 2026-09-11 — PR #90 e #91
No Message Parser/Builder, a entrada e o resultado passaram a ficar lado a lado (não empilhados); no Secure ZIP foi adicionada a mesma zona de arrastar ficheiro que já existia no Message Parser/Builder.

## 2026-09-11 — PR #88
Corrigido um bug grave no Parse PRL: passageiros sem localizador (`.L/`) na linha desapareciam por completo do resultado e do CSV exportado, em vez de aparecerem só sem essa coluna preenchida.

## 2026-09-11 — PR #85
Corrigido: clicar num erro destacado na mensagem já não faz saltar a página para a lista de resultados — só mostra a explicação no local.

## 2026-09-11 — PR #82
Corrigido um bug no parser de PRL: quando uma linha `.RN/` completava o nome próprio, o nome da reserva ficava todo substituído por essa remark, em vez de apenas juntar o resto do nome — isto corrompia o nome do passageiro no CSV exportado.

## 2026-09-11 — PR #81
Adicionada uma zona de "arrastar e largar" para carregar ficheiros PRL, PAXLST ou a lista de passageiros no Message Parser/Builder — antes só havia um botão simples.

## 2026-09-11 — PR #79
O ficheiro final passou a chamar-se `operations-center.html` (antes `aviation-ops-toolkit.html`). Quem tiver o ficheiro antigo guardado precisa de usar o novo nome.

## 2026-09-11 — PR #77
A ferramenta passou a chamar-se "Operations Center" (antes "Aviation Ops Toolkit") — nome atualizado no título, na barra lateral e nos documentos do repositório.

## 2026-09-11 — PR #75
Adicionado o ficheiro `CLAUDE.md` com as regras de trabalho do projeto (quando mergear sozinho, quando esperar aprovação, e como registar alterações), para ficarem guardadas junto do código.

## 2026-09-11 — PR #73
Corrigido falso erro "Malformed DOCS" quando a primeira linha `.RN/` de um `.R/DOCS` em branco tinha um espaço logo a seguir à barra — um formato real que ficava mal interpretado.

## 2026-09-11 — PR #71
Validação de documentos (`.R/DOCS`) corrigida para quando o estado e todos os campos vêm em branco na linha principal e são completados por uma ou mais linhas `.RN/` seguidas. Antes, este formato (raro mas real) fazia o validador saltar por completo a verificação de nome/associação/validade do documento.

## 2026-09-11 — PR #69 e #70
A mensagem de erro quando uma continuação `.RN/` ou `.SN/` aparece colada a outro elemento deixou de dizer "falta um espaço" (confuso) e passou a explicar que uma continuação tem de começar a sua própria linha.

## 2026-09-11 — PR #68
Revertida uma verificação nova que assinalava continuações `.RN/` como "pode não ser necessária" — exemplos reais de PNLs mostraram que é normal e válido usar `.RN/` mesmo bem abaixo do limite de 64 caracteres.

## 2026-09-09 — PR #66
Adotado o novo design escuro ("Luna") sugerido pelo utilizador, sem afetar o modo claro existente.

## 2026-09-08 — PR #65
Removido o aviso de "nome de passageiro duplicado" no Message Validator — pode legitimamente haver duas pessoas com o mesmo nome no mesmo voo ou PNR.

## 2026-09-08 — PR #64
O modo escuro passou a ser a opção por defeito ao abrir a ferramenta (antes seguia a preferência do sistema operativo).

## 2026-09-08 — PR #62 e #63
No Gerador de Layout de ULDs, pelo menos um porão a granel (bulk) passou a ser obrigatório antes de exportar o layout combinado, e os campos Left/Right foram adicionados aos porões a granel com os dados reais do A330-300.

## 2026-09-04 — PR #58 a #61
Adicionada uma verificação final de segurança antes da exportação de layouts (pesos, índices, e sinais fora do esperado), e os 5 manuais das ferramentas foram reescritos para refletirem o comportamento atual.

## 2026-09-03 — PR #49 a #57
Várias melhorias ao Gerador de Layout de ULDs: correção da vista de compartimentos e das etiquetas de zona, template do Boeing 767-300ER, opção de combinar ULDs idênticos numa posição, e undo (Ctrl+Z).

## Anterior a 2026-09-02
Versões iniciais das 5 ferramentas: Airline Message Toolkit, Message Validator, Secure ZIP, AHM Audit e ULD Layout Generator.
