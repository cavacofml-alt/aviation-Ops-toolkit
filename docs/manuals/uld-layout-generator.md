# Manual — ULD Layout Generator

**O que faz:** descreves o avião uma vez — que ULDs aceita, que posições tem
em cada porão — e a ferramenta gera **todas as combinações válidas** de
carregamento, sem sobreposições, cada uma com o seu index e peso máximo. No
fim exporta tudo para Excel ou CSV, no formato que o teu sistema importa.

É a ferramenta mais complexa do conjunto. Trabalha-se em **3 passos**, na
barra do topo: `ULDs → Compartments & Zones → Layouts`.

> **A forma mais fácil de começar é carregar um template pronto** e ajustar,
> em vez de construir um avião do zero.

---

## Começar depressa

1. Abre **ULD Layout Generator**.
2. Clica em **✈ TEMPLATES** no topo.
3. Escolhe o avião e clica em **LOAD**.

Vêm seis aviões prontos:

| Avião | Ref. station |
|---|---|
| Boeing 787-900 | 1199.2 |
| Boeing 777-200 | 1244.13 |
| Boeing 777-300 | 1258 |
| Boeing 767-300ER | 972.6 |
| Airbus A330-200 | 33.1555 |
| Airbus A330-300 | 36.35 |

⚠️ Carregar um template **substitui** tudo o que tinhas aberto. Se queres
guardar o que já fizeste, fecha a janela e usa primeiro **↓ EXPORT FILE**
(ou guarda-o em *Your aircraft*, mais abaixo).

Depois de carregado, salta direto para o **Passo 3** e gera. Se o avião que
precisas não está na lista, constrói-o com os passos seguintes.

---

## Passo 1 — ULDs (o catálogo)

Aqui dizes **que contentores e paletes existem** neste avião. É só a lista;
onde eles cabem vem no passo seguinte.

Para cada um:

| Campo | O que é |
|---|---|
| **ULD Type** | O código do tipo — `LD3`, `LD2`, `LD7/P88`, `PLA`… Escolhe na lista. |
| **IATA** | O código de 3 letras do contentor em concreto: `AKE`, `PMC`, `DPE`… |
| **Max weight (kg)** | O peso máximo que **esse ULD** aguenta. |
| **Tare (kg)** | O peso do contentor vazio. |

**+ ADD ULD** para cada um. Depois dá para **✎ EDIT** e **× REMOVE**. A tabela
ordena-se sozinha por tipo.

Podes ter vários IATAs do mesmo tipo (`AKE`, `AKC`, `PKC`… todos `LD3`) — é
normal e é assim que deve ser. O tipo é o que define onde cabem; o IATA é o
que distingue cada um.

⚠️ O **Max weight** que pões aqui é usado depois para verificar as posições.
Se apagares o último ULD de um tipo, todos os grupos desse tipo deixam de
gerar seja o que for — a ferramenta avisa-te quando isso acontece.

Só avanças com pelo menos 1 ULD definido.

---

## Passo 2 — Compartments & Zones

Aqui defines os **porões** e, dentro de cada um, os **grupos de posições**
onde cada tipo de ULD pode ir.

1. **+ COMPARTMENT** cria o porão 1, 2, 3…
2. Dentro do porão, escolhe um tipo em *Add ULD group* e clica em **+ ADD
   GROUP**.
3. Dentro do grupo, cria as posições.

### As duas formas de encher uma baia

Os grupos de tipos que se carregam **dois lado a lado** (LD3, LD2, L3P/PKC)
têm dois botões; os restantes têm só o segundo:

- **+ L/R PAIR** — dois contentores lado a lado na mesma baia. Preenches os
  valores comuns uma vez (base, FWD, AFT, offset, index, peso) e a ferramenta
  cria o `L` e o `R` de uma vez, já com os braços trocados.
- **+ POSITION** — **um contentor a ocupar a baia sozinho**. Serve para
  paletes e para os casos em que um contentor enche a baia por si só.

  Se ele não ficar ao centro, mete os braços laterais em **LEFT/RIGHT** e a
  ferramenta trata dele como posição única deslocada. Exemplo: um AKE com 70
  de largura num porão de 100 — não cabe nada ao lado, mas também não está
  centrado.

  A mesma baia pode ter **as duas opções** ao mesmo tempo (um ao meio, ou
  dois ao lado): cria as duas, e a ferramenta oferece-as como alternativas
  que nunca aparecem juntas no mesmo layout.

### Os campos de cada posição

| Campo | O que é |
|---|---|
| **POSITION** | O nome da posição: `11L`, `11R`, `12P`, `13`… |
| **FWD STAT** / **AFT STAT** | Estações à frente e atrás da posição. |
| **LEFT** / **RIGHT** | Braço lateral. `0/0` se a posição está centrada. |
| **INDEX** | Índice de balanceamento por unidade de peso, nessa posição. |
| **MAX WT (KG)** | Peso máximo **nesta posição** — pode ser inferior ao do ULD. |

**Dois automatismos que poupam trabalho:**

- Ao dar nome a uma posição de baia inteira (`12`), se já existir o par
  `12L`/`12R` nesse porão, o FWD, o AFT e o index são preenchidos sozinhos.
  Só acontece se ainda não tiveres escrito nada nesses campos.
- Num par `L`/`R`, editar um lado atualiza o outro — nos dois sentidos. FWD,
  AFT, index e peso ficam iguais; os braços ficam trocados.

**Casas decimais do index:** o editor aceita até **6** casas. O ficheiro
exportado leva **5** — o arredondamento acontece só à saída, os teus valores
ficam intactos. (Um index tão pequeno que arredonde para `0` é apanhado na
verificação antes de exportar.)

### CERTIFIED ULDS

Por baixo das opções, uma caixa por cada ULD desse tipo que tens no catálogo,
**todas ligadas de início**. Desliga as que não sejam certificadas neste
avião. Isto muda o nome do layout:

- todas ligadas → `2LD3` (qualquer LD3 serve)
- só algumas → `2LD3(AKE/PKC)` (só estes)

A coluna *Certified ULDs* do ficheiro leva sempre o **código de tipo**, por
isso não é afetada por isto. Não dá para desligar a última — um grupo sem
nenhum ULD deixa de gerar.

### As duas opções do grupo

- **Use in layout generation** — desliga para o grupo não entrar nas
  combinações, sem o apagares.
- **Only on its own — never mixed with other types** — liga se este tipo só
  puder aparecer sozinho no porão, nunca misturado com outros.

Só avanças quando todos os grupos tiverem pelo menos 1 posição.

> **REF. STATION** (no topo, ao lado dos botões) é a referência contra a qual
> os sinais dos index são verificados. Muda-a e o desenho do avião atualiza-se
> logo.

---

## Passo 3 — Layouts

### Combinar ULDs na mesma posição

A caixa por baixo dos botões, **ligada por omissão**. Decide o que acontece
quando dois tipos diferentes cabem na mesma posição com o **mesmo FWD/AFT,
o mesmo index e o mesmo peso máximo**:

| | Resultado |
|---|---|
| **Ligada** | Partilham a posição: um layout `2LD3/LD2`, e a coluna leva os dois — `"LD3,LA;LD2,LA"` |
| **Desligada** | Cada tipo com o seu layout: `2LD3` e `2LD2` em separado |

Qual escolher depende do sistema para onde vais importar — por isso a escolha
é tua. Não altera nenhum dado teu, e se já tiveres layouts gerados são
recalculados na hora para veres a diferença. Fica guardada com o trabalho e
vai também no **↓ EXPORT FILE**.

⚠️ Isto só se aplica quando os números são **exatamente iguais**. Basta o
index ou o peso diferirem num dígito e os tipos ficam sempre separados, com a
caixa ligada ou desligada.

O que **não** muda com esta caixa: um grupo ticado para vários ULDs lista-os
sempre todos na mesma posição. A caixa separa **grupos**, não as ticks.

### Gerar e ler

1. **⚡ GENERATE ALL LAYOUTS**.
2. Aparece o avião de lado, cada porão com a sua cor, e por baixo os números
   de combinações encontradas.
3. Clica num porão no desenho, ou nos separadores *Compartment 1, 2…*, para
   ver as combinações desse porão.
4. Clica numa linha para a abrir e ver as posições exatas — com o desenho da
   baia e a tabela de estações, index e pesos.

Se editares alguma posição depois de gerar, aparece um aviso a dizer que os
dados mudaram: clica outra vez em **GENERATE ALL LAYOUTS**.

---

## Os avisos

Quando há dados que merecem uma segunda vista, aparece uma linha por cima dos
layouts. Há duas cores:

| | |
|---|---|
| **Amarela** — `⚠ N positions worth checking` com um botão **REVIEW** | Não bloqueia nada. Fica fechada, numa linha só, para não empurrar o trabalho para baixo. Abre em **REVIEW**. |
| **Vermelha** — `Cannot generate` | Bloqueia. Está sempre aberta, porque não há nada a gerar até resolveres. |

Aberta, os avisos vêm **agrupados pelo problema**, não um por posição: cada
problema explicado uma vez, e por baixo as posições afetadas em etiquetas
(`25P C2 · LD7/P96`). Clica numa etiqueta para saltar direto ao grupo no
Passo 2, já aberto. Passa o rato por cima para ver o detalhe daquela posição.

**Todos os avisos comparam os teus dados uns com os outros** — o peso da
posição contra o peso do ULD no catálogo, o index contra a ref. station que
introduziste, cada valor contra os seus vizinhos. Não há aqui nenhuma
autoridade externa: o que conta é o que está na aplicação, porque é isso que
vai para o ficheiro. Quando um aviso aparece, há sempre **dois valores teus a
discordarem** — o trabalho é decidir qual dos dois está certo.

### Dois que valem uma leitura atenta

Nestes dois há dados teus que **não chegam ao ficheiro**:

- **"another LD3 group describes this bay with different numbers"** — tens
  dois grupos do mesmo tipo a descrever a mesma baia com index ou peso
  diferentes. Como o nome do layout é feito do tipo e dos ULDs ticados, ambos
  se chamariam `2LD3`, e **só um é gerado**. Junta os dois grupos num só, ou
  destica cada um até ao seu ULD — aí ficam `2LD3(AKE)` e `2LD3(PKC)`, nomes
  diferentes, e os dois sobrevivem.
- **"no LD3 left in the ULD catalog"** — apagaste do catálogo o último ULD de
  um tipo que ainda tem grupos. Esses grupos deixam de gerar e as suas
  posições não aparecem no ficheiro. Volta a criar o ULD, ou remove o grupo.

---

## Exportar

- **↓ EXPORT ALL (EXCEL)** — um `.xlsx` com tudo. **É o formato
  recomendado**: abre sempre certo em qualquer Excel, sem configurações. A
  folha chama-se sempre `D3`, que é o nome fixo que o sistema de upload
  espera, para qualquer avião.
- **↓ EXCEL COMPARTMENT N** — só um porão.
- **CSV (ALL)** / **CSV** — texto simples, só se precisares mesmo. Consoante
  as definições regionais do Windows, pode ser preciso abrir com **Dados →
  De Texto/CSV** em vez de duplo-clique, para o Excel separar as colunas.

### A verificação antes de exportar

Ao carregar em qualquer botão de export, a ferramenta olha primeiro para os
números **tal como vão ficar no ficheiro** — já arredondados às 5 casas, e
lidos dos layouts gerados, não do editor. Se estiver tudo bem, o ficheiro sai
direto e não vês nada.

Se houver algo a apontar, aparece **"Check before exporting"** com os
problemas agrupados e duas saídas: **EXPORT ANYWAY** ou **GO BACK AND
CHECK**. As etiquetas saltam para o campo que as originou.

O que é verificado:

| Verificação | O que apanha |
|---|---|
| **Sinal do index** | Index positivo à frente da ref. station, ou negativo atrás. Um sinal trocado desloca o CG para o lado errado. É perguntado outra vez aqui, mesmo que já tenhas aceitado o aviso antes de gerar. |
| **Index que arredonda para zero** | Tão pequeno que sai do ficheiro como `0` — a posição deixa de contar para o trim, seja o que for que lá ponhas. |
| **Peso acima do ULD** | A posição autoriza mais peso do que o ULD mais leve ali ticado tem no catálogo. O ficheiro levaria o valor mais alto. |
| **Peso fora do normal** | Três vezes mais (ou menos) do que as outras posições do mesmo tipo — um dígito a mais ou a menos. |
| **Index fora do compartimento** | Ordens de grandeza fora do resto do porão: ponto decimal fora do sítio. |
| **Peso inutilizável** | Zero ou em branco. |
| **Layouts desatualizados** | Editaste posições depois de gerar; o ficheiro descreveria números que já não tens. |

### Porões bulk

Os porões de carga solta (sem ULDs) aparecem no desenho e saem no export
combinado como linhas `BULK`, mas **não passam pela geração de layouts** —
não têm combinações a calcular. Consequência prática: a verificação antes de
exportar é **o único sítio** onde o index e o peso deles são vistos.

Vêm dos templates ou de um ficheiro importado; não há campos para os editar
no ecrã.

---

## Desfazer

**↶ UNDO** (na barra do topo) desfaz a última ação destrutiva: remover um
grupo, um compartimento, uma posição ou um ULD, desligar uma tick dos
Certified ULDs, carregar um template por cima do teu trabalho, ou o Reset.
Passa o rato por cima para ver o que vai desfazer. Guarda as últimas 12
ações, só enquanto a página estiver aberta.

**Atalho: `Ctrl+Z`** (`Cmd+Z` no Mac) — útil quando estás no fim de uma lista
longa e o botão já não está à vista. Aparece uma confirmação em baixo a dizer
o que foi desfeito.

Dentro de um campo de texto, o `Ctrl+Z` continua a ser o desfazer normal da
escrita. Clica fora do campo primeiro se queres desfazer a ação anterior.

---

## Guardar o trabalho

**Automático neste browser.** O indicador **"Saved HH:MM"** no topo confirma.
É só neste computador e neste browser — não é uma cópia de segurança.

**↓ EXPORT FILE / ↑ IMPORT** — um `.json` com tudo (ULDs, porões, posições,
ref. station e a opção de combinar). É assim que levas um avião para outro
computador ou o guardas a sério.

**Your aircraft** (dentro de ✈ TEMPLATES) — guarda o avião que montaste com
um nome, para o voltares a carregar quando quiseres:

1. Monta o avião.
2. Abre **✈ TEMPLATES**, escreve um nome em *Save the current setup as* e
   clica em **↓ SAVE AIRCRAFT**.
3. Fica na lista, com **LOAD** para carregar e **×** para apagar.

Guardar com um nome que já existe substitui o anterior. ⚠️ Também ficam só
**neste browser** — para levar para outra máquina continua a ser o
`↓ EXPORT FILE`.

**↺ RESET** apaga tudo. Exporta primeiro se queres manter alguma coisa (e o
`Ctrl+Z` ainda o desfaz, enquanto a página estiver aberta).

---

## Termos rápidos

| Termo | Significado |
|---|---|
| ULD | *Unit Load Device* — contentor ou palete de carga |
| Compartimento / porão | Um porão do avião (1, 2, 3, 4…) |
| Baia | O espaço ao longo do porão que uma posição ocupa (`11`, `12`…) |
| Posição | Um lugar concreto: `11L`, `11R`, `12P`, `13` |
| Layout | Uma combinação completa e válida de ULDs a ocupar um porão |
| Index | Valor usado no cálculo do centro de gravidade |
| Ref. station | A estação de referência contra a qual o sinal do index é medido |
| Tara | Peso do ULD vazio |
