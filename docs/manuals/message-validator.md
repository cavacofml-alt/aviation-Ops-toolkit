# Manual — Message Validator

O que faz: verifica mensagens de telex (PNL, ADL, PSM, MVT, SSM e mais 11 tipos) contra a norma IATA, e diz-te exatamente qual o carácter errado e porquê.

## Passo a passo

1. Abre a ferramenta **Message Validator** no menu lateral.
2. Cola a mensagem (ou escreve-a) diretamente na caixa grande do topo. Não há botão "colar" — usa Ctrl+V (ou Cmd+V no Mac) depois de clicares dentro da caixa.
3. Clica em **Validate message**.
4. A caixa passa a mostrar um número de linha e uma régua no topo (1, 2, 3…), e os caracteres com problemas ficam sublinhados a cores:
   - **Vermelho** = erro (tem de ser corrigido).
   - **Amarelo** = aviso (confirma se está correto, mas não bloqueia).
   - **Azul** = informação (só um alerta, geralmente inofensivo).
5. Em baixo, em **Validation result**, aparece a lista completa de problemas, um por um, com a explicação e a regra do manual por trás de cada um (RP 1707b, AIRIMP, AHM, etc.).
6. Podes filtrar a lista pelos separadores **All / errors / warnings / info** no topo dessa secção.

## Corrigir erros diretamente

- Clica em qualquer carácter sublinhado (ou na entrada da lista de erros) — o cursor salta logo para esse ponto exato na caixa da mensagem.
- Escreve a correção ali mesmo, na própria caixa. Não precisas de copiar/colar para outro sítio.
- Passados menos de 1 segundo depois de parares de escrever, a ferramenta volta a validar sozinha (repara no indicador **"typing…" → "live"** no canto superior direito da secção de resultados).

## Outros botões

- **Load example**: carrega uma mensagem de exemplo válida do tipo escolhido na lista (PNL, PSM, MVT…), só para veres como a ferramenta funciona.
- **Example with errors**: carrega a mesma mensagem, mas com erros propositados — útil para testar/aprender.
- **Clear**: apaga tudo e recomeça do zero.
- **Copy message** (aparece depois de validares): copia o texto atual da mensagem para a área de transferência.
- **Export report** (aparece depois de validares): descarrega um relatório de texto com todos os problemas encontrados — útil para anexar a um email ou guardar como prova.

## Dica

Não precisas de saber que tipo de mensagem estás a colar (PNL, ADL, etc.) — a ferramenta deteta isso sozinha ao analisar o conteúdo.
