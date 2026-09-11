# Registo de Alterações

Histórico de versões, em linguagem simples. Cada entrada explica o que mudou e porquê, em no máximo 2 linhas.

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
