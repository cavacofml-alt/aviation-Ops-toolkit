# Manual — ULD Layout Generator

O que faz: define os ULDs (contentores/paletes) e os compartimentos de um avião, e gera automaticamente **todas as combinações possíveis** de posições válidas, com o índice de balanceamento e o peso máximo de cada uma — sem sobreposições. No fim, exporta tudo para Excel/CSV.

Esta é a ferramenta mais complexa do conjunto. A forma mais fácil de começar é sempre **carregar um template já pronto** em vez de construir tudo do zero.

## Atalho rápido: usar um template existente

1. Abre **ULD Layout Generator**.
2. Clica em **✈ Templates** no topo.
3. Escolhe o avião (ex: Boeing 777-200, Airbus A330-200…) e clica em **LOAD**.

   ⚠️ Isto **substitui** tudo o que já tinhas configurado. Se quiseres guardar o que tens antes, fecha esta janela e usa primeiro **↓ Export file**.
4. Segue os passos abaixo a partir de "Passo 3 — Gerar layouts".

Se o avião que precisas ainda não existe como template, continua a ler para construíres um do zero (ou pede para ser adicionado, com as páginas do manual de peso e balanceamento do avião).

## Os 3 passos (barra no topo: ULDs → Compartments & Zones → Layouts)

### Passo 1 — ULDs

Aqui defines o **catálogo** de tipos de contentor/palete que o avião aceita (ex: AKE, PMC, PAG…).

Para cada um, preenche:
- **ULD Type**: o código do tipo (LD3, LD7/P88, PLA…) — escolhe na lista.
- **IATA**: o código IATA de 3 letras (ex: `AKE`).
- **Max weight (kg)**: peso máximo certificado.
- **Tare (kg)**: peso vazio do próprio contentor/palete (para descontar do peso da carga).

Clica em **+ Add ULD** para cada tipo. Podes editar (✎ Edit) ou remover (✕ Remove) depois. A tabela ordena-se sempre pelo tipo de ULD.

Só avanças para o passo seguinte depois de teres pelo menos 1 ULD definido.

### Passo 2 — Compartments & Zones

Aqui defines os **compartimentos físicos** do avião (porão 1, 2, 3…) e, dentro de cada um, os **grupos de posições** onde cada tipo de ULD pode ir.

1. Clica em **+ Add compartment** para criar o compartimento 1, 2, etc.
2. Dentro de um compartimento, escolhe um tipo de ULD na lista "Add ULD group" e clica em **+ Add group**.
3. Dentro do grupo, clica em **+ Position** para cada posição física (ex: `11L`, `11R`, `12P`…) e preenche:
   - **FWD STAT** / **AFT STAT**: estações dianteira/traseira dessa posição (do manual de peso e balanceamento).
   - **LEFT** / **RIGHT**: braço lateral (0 se a posição não for L/R).
   - **INDEX**: índice de balanceamento por unidade de peso, nessa posição.
   - **MAX WT (KG)**: peso máximo permitido *nessa posição em concreto* (pode ser diferente do máximo geral do ULD).
4. Se dois tipos de ULD (ex: AKE e PKC) cabem exatamente na mesma posição, com os mesmos valores, cria um grupo para cada um — a ferramenta junta-os automaticamente numa só opção mais tarde, sem duplicar layouts.

Cada grupo tem duas opções:
- **Use in layout generation**: desliga se não quiseres que este tipo entre nas combinações geradas (ex: um tipo raramente usado).
- **Only on its own — never mixed with other types**: liga se este tipo só puder aparecer sozinho no compartimento, nunca misturado com outros.

E, por baixo, a linha **CERTIFIED ULDS**: uma caixa por cada ULD desse tipo que
tenhas no catálogo, todas ligadas de início. Desliga as que não sejam
certificadas neste avião. Isto muda o nome do layout no export:

- todas ligadas → `2LD3` (qualquer LD3 serve)
- só algumas → `2LD3(AKE/PKC)` (só estes)

A coluna "Certified ULDs" do ficheiro leva sempre o código de tipo, por isso
não é afetada. Não dá para desligar a última — um grupo sem nenhum ULD deixaria
de gerar seja o que for.

Só avanças para o passo seguinte quando todos os grupos tiverem pelo menos 1 posição.

### Passo 3 — Layouts (gerar e exportar)

#### Combinar ULDs na mesma posição (caixa por baixo dos botões)

Quando dois tipos diferentes cabem na mesma posição **com o mesmo FWD/AFT,
o mesmo index e o mesmo peso máximo**, tens duas maneiras de os tratar — e
a escolha é tua, porque depende do sistema para onde vais importar o ficheiro:

- **Ligada** (por omissão): partilham a mesma posição. Sai um único layout
  `2LD3/LD2`, e a coluna *Certified ULDs* leva os dois — `"LD3,LA;LD2,LA"`.
- **Desligada**: cada tipo tem o seu próprio layout, mesmo com os números
  iguais — `2LD3` e `2LD2` em separado, cada um com o seu tipo na coluna.

A caixa só muda a forma como os layouts são apresentados e exportados; não
altera nenhum dado que tenhas introduzido. Se já tiveres layouts gerados,
são recalculados na hora para veres a diferença. A escolha fica guardada com
o resto do trabalho e vai também no **↓ Export file**.

Isto só se aplica quando os números são **exatamente iguais**. Se o index ou
o peso da posição diferirem nem que seja num dígito, os tipos ficam sempre
separados, com a caixa ligada ou desligada.

#### Gerar

1. Clica em **⚡ Generate all layouts**.
2. Aparece o desenho do avião de lado, com cada compartimento colorido, e por baixo uma tabela por compartimento com todas as combinações válidas encontradas.
3. Clica num compartimento no desenho (ou nos separadores "Compartment 1", "Compartment 2"…) para ver as suas combinações.
4. Clica numa linha da lista para expandir e ver as posições exatas dessa combinação.

### Exportar

- **↓ Export all (Excel)**: descarrega um ficheiro `.xlsx` com todas as combinações de todos os compartimentos — este é o formato recomendado, porque abre sempre certo em qualquer Excel, sem configurações.
- **CSV (all)** / **CSV compartment N**: alternativa em texto simples, só se precisares mesmo de `.csv` (ex: para um sistema que só aceite esse formato). Nota: dependendo das definições regionais do Windows, pode ser preciso abrir com **Data → From Text/CSV** em vez de duplo-clique direto, para o Excel separar as colunas corretamente.

### A verificação antes de exportar

Sempre que carregas num dos botões de export, a ferramenta olha primeiro
para os números **tal como vão ficar no ficheiro** — já arredondados às 5
casas decimais, e lidos dos layouts gerados, não do editor. Se estiver tudo
bem, o ficheiro sai direto e não vês nada. Se houver algo a apontar, aparece
uma janela **"Check before exporting"** com os problemas agrupados, e duas
saídas: **Export anyway** ou **Go back and check**. Cada etiqueta salta para
o campo que a originou.

O que é verificado:

| Verificação | O que apanha |
|---|---|
| **Sinal do index** | Index positivo à frente da ref. station, ou negativo atrás. Um sinal trocado desloca o centro de gravidade para o lado errado. É perguntado outra vez aqui mesmo que já tenhas aceitado o aviso antes de gerar. |
| **Index que arredonda para zero** | Um index tão pequeno que sai do ficheiro como `0` — a posição deixa de contar para o trim, seja o que for que lá ponhas. |
| **Peso acima do ULD** | O ficheiro autorizaria carregar mais do que o ULD mais leve certificado ali aguenta. |
| **Peso fora do normal** | Três vezes mais (ou menos) do que as outras posições do mesmo tipo — tipicamente um dígito a mais ou a menos. |
| **Index fora do compartimento** | Ordens de grandeza fora do resto do porão: ponto decimal fora do sítio. |
| **Peso inutilizável** | Zero ou em branco: não se carrega nada contra ele. |
| **Layouts desatualizados** | Editaste posições depois de gerar, por isso o ficheiro descreveria números que já não tens. |

Nos porões **bulk** esta é a única verificação que existe — eles não passam
pela geração de layouts, por isso o index e o peso deles só são olhados aqui.

Nota: nos templates B787-900 e B777-300 esta janela aparece sempre, com as
posições que o próprio manual certifica acima do ULD (25P, 31P, 41P, 42P).
Não é um erro — é o manual a dizer isso mesmo. Confirmas e exportas.

### Se aparecer um aviso de "dados alterados"

Se editares qualquer posição depois de já teres gerado os layouts, aparece um aviso amarelo a dizer que os dados mudaram. Basta clicar outra vez em **Generate all layouts** para atualizar tudo.

### A caixa de avisos

Quando há dados que merecem uma segunda vista, aparece uma linha amarela por
cima dos layouts: **"⚠ N positions worth checking"**, com um botão **REVIEW**
à direita. Fica fechada — é só uma linha — para não empurrar o trabalho para
baixo. Clica em **REVIEW** para abrir.

Aberta, os avisos vêm **agrupados pelo tipo de problema**, não um por
posição: cada problema é explicado uma vez, e por baixo ficam as posições
afetadas em pequenas etiquetas (`11 C1 · LD3`). Clica numa etiqueta para
saltar direto ao grupo no Passo 2, já aberto para editares. Passa o rato por
cima para veres o detalhe daquela posição em concreto.

Se houver dados que **impedem** a geração, essa caixa é vermelha e está
sempre aberta — não há nada a gerar até resolveres.

Dois dos avisos valem uma leitura atenta, porque em ambos há dados teus que
não chegam ao ficheiro final:

- **"another LD3 group describes this bay with different numbers"** — tens
  dois grupos do mesmo tipo a descrever a mesma baia com index ou peso
  diferentes. Como o nome do layout é feito do tipo (e dos ULDs ticados),
  ambos se chamariam `2LD3` e **só um é gerado**. Resolve-se juntando os dois
  grupos num só, ou desticando cada um até ao seu ULD — aí ficam `2LD3(AKE)`
  e `2LD3(PKC)`, com nomes diferentes, e os dois são gerados.
- **"no LD3 left in the ULD catalog"** — apagaste do catálogo (Passo 1) o
  último ULD de um tipo que ainda tem grupos no Passo 2. Esses grupos deixam
  de gerar seja o que for e as suas posições não aparecem no export. Volta a
  criar o ULD no catálogo, ou remove o grupo.

## Desfazer

O botão **↶ Undo** (na barra do topo, ao lado do Reset) desfaz a última ação
destrutiva: remover um grupo, um compartimento, uma posição ou um ULD, desligar
uma caixa dos Certified ULDs, carregar um template por cima do que tinhas, ou o
Reset. Passa o rato por cima para ver o que vai desfazer. Guarda as últimas 12
ações, e só enquanto a página estiver aberta.

**Atalho: `Ctrl+Z`** (`Cmd+Z` no Mac). Útil quando estás no fim de uma lista
longa de posições e o botão já não está à vista — aparece uma confirmação em
baixo a dizer o que foi desfeito.

Dentro de um campo de texto o `Ctrl+Z` continua a ser o desfazer normal da
escrita, como em qualquer página. Clica fora do campo primeiro se quiseres
desfazer a ação anterior.

## Guardar os teus próprios aviões

Em **✈ Templates**, por baixo da lista dos aviões que vêm com a ferramenta, há a
secção **Your aircraft**:

1. Monta o avião (ULDs, compartimentos, posições).
2. Abre **✈ Templates**, escreve um nome em "Save the current setup as" e clica
   em **↓ Save aircraft**.
3. Fica ali para carregares sempre que precisares, com o botão **LOAD** — e o
   **×** apaga.

Guardar com um nome que já existe substitui o anterior.

⚠️ Ficam guardados **neste browser**, neste computador. Para levar um avião para
outra máquina continua a ser o `↓ Export file` / `↑ Import`.

## Guardar o teu trabalho

- O que preenches fica guardado automaticamente neste browser (indicador **"Saved HH:MM"** no topo) — mas só neste computador/browser.
- Para levares a configuração para outro computador, ou guardares uma cópia de segurança, usa **↓ Export file** (fica um `.json`) e depois **↑ Import** nesse ficheiro noutra sessão.
- **↺ Reset** apaga tudo — usa com cuidado, e exporta primeiro se quiseres manter alguma coisa.

## Termos rápidos

| Termo | Significado |
|---|---|
| ULD | Unit Load Device — contentor ou palete de carga |
| Compartimento | Um porão do avião (1, 2, 3, 4…) |
| Zona/Posição | Um lugar físico específico dentro do compartimento (ex: `21L`) |
| Layout | Uma combinação completa e válida de ULDs a ocupar um compartimento |
| Index | Valor usado no cálculo do centro de gravidade do avião |
