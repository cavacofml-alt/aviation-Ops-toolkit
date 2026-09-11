# Regras de trabalho neste projeto

## Comunicação
- Responder sempre em português europeu, de forma concisa.

## Fluxo de PRs e merge
- **Correções de bugs** (comportamento errado, validação incorreta, mensagens erradas, etc.): criar a PR e fazer merge diretamente, sem esperar confirmação.
- **Alterações maiores** (novas funcionalidades, mudanças de design/UI, mudanças de comportamento visível ao utilizador): criar a PR mas **não** fazer merge — explicar o que mudou e esperar aprovação antes de mergear.
- Em caso de dúvida sobre a categoria de uma alteração, perguntar antes de decidir.

## CHANGELOG.md
- Toda a alteração de código fica registada no `CHANGELOG.md`, com uma explicação simples e não técnica de no máximo 2 linhas.
- A entrada do changelog vai na mesma PR da alteração.
- Depois de atualizar o changelog, mostrar no chat o texto exato que foi adicionado.

## Build e testes
- Antes de qualquer commit: `python3 build.py --check` tem de passar sem falhas.
- Depois de editar `src/core/engine.js` ou `src/modules/uld/uld.js`, confirmar que não foram inseridos bytes NUL:
  `python3 -c "print(open('src/core/engine.js','rb').read().count(b'\x00'))"` (deve dar 0).

## Alojamento (em transição)
- O repositório de trabalho (onde o código é editado e testado) está a ser decidido entre Azure DevOps e GitHub empresarial — por agora continua no GitHub pessoal.
- O SharePoint da empresa vai servir como arquivo/distribuição do ficheiro final (`dist/aviation-ops-toolkit.html`) e do `CHANGELOG.md`, não como ambiente de edição — não corre código.
- A versão de produção fica num PC numa rede isolada; a atualização é sempre manual (não há ligação automática).
