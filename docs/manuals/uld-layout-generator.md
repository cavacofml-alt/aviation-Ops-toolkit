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

1. Clica em **⚡ Generate all layouts**.
2. Aparece o desenho do avião de lado, com cada compartimento colorido, e por baixo uma tabela por compartimento com todas as combinações válidas encontradas.
3. Clica num compartimento no desenho (ou nos separadores "Compartment 1", "Compartment 2"…) para ver as suas combinações.
4. Clica numa linha da lista para expandir e ver as posições exatas dessa combinação.

### Exportar

- **↓ Export all (Excel)**: descarrega um ficheiro `.xlsx` com todas as combinações de todos os compartimentos — este é o formato recomendado, porque abre sempre certo em qualquer Excel, sem configurações.
- **CSV (all)** / **CSV compartment N**: alternativa em texto simples, só se precisares mesmo de `.csv` (ex: para um sistema que só aceite esse formato). Nota: dependendo das definições regionais do Windows, pode ser preciso abrir com **Data → From Text/CSV** em vez de duplo-clique direto, para o Excel separar as colunas corretamente.

### Se aparecer um aviso de "dados alterados"

Se editares qualquer posição depois de já teres gerado os layouts, aparece um aviso amarelo a dizer que os dados mudaram. Basta clicar outra vez em **Generate all layouts** para atualizar tudo.

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
