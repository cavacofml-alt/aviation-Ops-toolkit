# Manual — Airline Message Toolkit

Três ferramentas independentes num só sítio, tudo processado no browser (nada sai do computador): ler um **PRL**, ler um **APIS PAXLST**, e construir um **PNL** a partir de uma lista de passageiros em Excel/CSV.

Muda entre elas nos três botões no topo: **PRL Parser**, **APIS PAXLST Parser**, **PNL Builder**.

---

## 1. PRL Parser

O que faz: lê uma mensagem PRL e devolve uma tabela com um documento de viagem por linha (nome, PNR, lugar, dados do passaporte/documento).

1. Cola a mensagem PRL na caixa "PRL input", **ou** clica em **📎 Load TXT file** e escolhe o ficheiro `.txt`.
2. Clica em **Parse PRL**.
3. A tabela "PRL result" aparece logo a seguir, com uma linha por documento encontrado.
4. Clica em **↓ Download CSV** para guardar o resultado como ficheiro `.csv` (abre em Excel).
5. **Clear** limpa tudo e recomeça.

---

## 2. APIS PAXLST Parser

O que faz: lê uma mensagem APIS PAXLST (mensagem única ou em várias partes) e devolve uma tabela com um documento por linha.

1. Cola a mensagem na caixa "APIS PAXLST input", **ou** carrega um ficheiro `.txt`.
2. Clica em **Parse PAXLST**.
3. A tabela de "Passenger documents" aparece com todos os campos: nome, género, data de nascimento, nacionalidade, PNR, lugar, e dados de cada documento.
4. **↓ Download CSV** guarda o resultado.

Não precisas de limpar os caracteres de controlo da mensagem antes de colar — a ferramenta já ignora automaticamente quebras de linha, apóstrofos (`'`) e cifrões (`$`) usados como separadores.

---

## 3. PNL Builder

O que faz: a partir de uma lista de passageiros (ficheiro `.csv` ou `.xlsx`), gera uma mensagem PNL pronta no formato PSCRM.

### Passo 1 — Preenche os dados do voo

| Campo | Exemplo | Nota |
|---|---|---|
| Airline | `XC` | 1 a 3 letras/números |
| Flight number | `7`, `1234` ou `123A` | Só o último carácter pode ser letra |
| Flight date | (calendário) | Data do voo |
| Origin | `LIS` | 3 letras |
| Destination | `OPO` | 3 letras |
| Default booking class | `Y` | Usada só quando a lista não tem a classe de um passageiro |

### Passo 2 — Carrega a lista de passageiros

> **Começa pelo template.** Na caixa *Passenger-list template* tens
> **↓ TEMPLATE CSV** e **↓ TEMPLATE EXCEL** — descarrega um deles e trabalha
> por cima. Já vem com as colunas todas pela ordem certa e com um exemplo
> preenchido (um passageiro com dois documentos: passaporte e um segundo).
> Poupa-te a acertar os nomes das colunas à mão.

Clica em **📎 Load passenger list (CSV/XLSX)** e escolhe o ficheiro. Colunas obrigatórias (têm de existir no ficheiro, mesmo que algumas células fiquem em branco):

```
Surname, GivenName, Gender, DateOfBirth, Nationality, RecordLocator, Seat,
DocumentType, DocumentNumber, DocumentIssueCountry, DocumentIssueDate,
DocumentExpiryDate, BCN
```

A classe de reserva vem de uma coluna `BookingClass`, `Class` ou `RBD` (se existir); senão usa-se a "Default booking class" do passo 1.

Se faltar alguma coluna obrigatória, aparece uma mensagem vermelha a dizer exatamente quais. Se carregar com sucesso, aparece a verde quantas linhas de documento foram lidas.

### Passo 3 — Gerar

Clica em **Build PNL**. O resultado aparece em baixo, com:
- Um resumo (nº de passageiros, documentos, classes de reserva, data do voo).
- O texto completo da mensagem PNL, pronto a usar.

Usa **📋 Copy** para copiar o texto, ou **↓ Download PNL.txt** para guardar como ficheiro.

### Coisas a saber

- Cada passageiro é identificado pela combinação **Apelido + Nome próprio +
  PNR + Data de nascimento**. Só se os quatro forem iguais é que duas linhas
  são tratadas como a mesma pessoa — a data de nascimento entra na conta
  precisamente para que dois homónimos sem PNR (pai e filho com o mesmo nome,
  por exemplo) não se fundam num só passageiro.
- Só é incluído um documento de passaporte por passageiro na linha `.R/DOCS` (o primeiro com `DocumentType = P`); outros documentos (não-passaporte) aparecem em linhas `.R/DOCO` separadas.
- **Países:** a nacionalidade e o país emissor são convertidos para o código
  de 2 letras — `PRT` fica `PT`, `USA` fica `US`. A conversão cobre os países
  mais frequentes (`USA GBR CAN DEU MMR PRT ESP FRA ITA NLD BEL CHE AUT TUR`);
  **qualquer outro código passa tal e qual como o escreveste**. Se trabalhas
  com destinos fora desta lista, escreve já o código de 2 letras na tua lista
  de passageiros — é o mais seguro.
- Campos como `RecordLocator`, `Seat` ou `BCN`, se estiverem em branco na lista, simplesmente não aparecem nessa linha da mensagem — não ficam pendurados sem valor.
- **Clear** apaga a lista carregada e o PNL gerado, para recomeçares.
