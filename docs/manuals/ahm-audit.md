# Manual — AHM Audit

O que faz: é um **atalho** para abrir a aplicação AHM Audit, que corre num servidor da rede local — não é uma ferramenta em si, só uma forma rápida de lá chegar.

## Passo a passo

1. Abre a ferramenta **AHM Audit** no menu lateral.
2. No campo **Application address**, confirma o endereço (já vem preenchido por defeito). Se precisares de outro, escolhe-o na lista que aparece ao clicar no campo, ou escreve o teu.
3. Clica em **Open AHM Audit**. A aplicação abre num novo separador do browser.
4. Faz login normalmente na página da aplicação — a toolkit não guarda nem envia o teu utilizador/password, é só o atalho para lá chegar.

## Se não abrir

Se aparecer um erro do tipo `ERR_CONNECTION_REFUSED`, o problema não é desta ferramenta — significa que não há nada a "escutar" naquele endereço: a aplicação AHM Audit pode estar desligada, ou o endereço/porta estão errados. Confirma com quem administra o servidor.

## Nota

Só funciona quando estás ligado à rede onde a aplicação AHM Audit está instalada (ex: rede da empresa). Fora dessa rede, não vai abrir.
