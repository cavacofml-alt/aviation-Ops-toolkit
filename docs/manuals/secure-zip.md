# Manual — Secure ZIP

O que faz: pega em ficheiros (ou texto) e devolve-te um `.zip` encriptado com uma password forte gerada automaticamente. Tudo acontece no teu browser — nada é enviado para lado nenhum.

## Passo a passo

1. Abre a ferramenta **Secure ZIP**.
2. Junta o que queres proteger:
   - **Anexar ficheiros**: clica em **📎 Attach files** e escolhe um ou vários ficheiros do computador (limite: 64 MB por ficheiro, 128 MB no total).
   - **Colar texto**: escreve ou cola o texto na caixa "Or paste text", dá-lhe um nome de ficheiro (ex: `mensagem.txt`) e clica em **+ Add as file**.
   - Podes repetir e juntar vários ficheiros e/ou textos ao mesmo pacote — todos aparecem numa lista, com opção de remover cada um (✕).
3. Escolhe o **estilo da password** em "Password":
   - **Random — letters, digits, symbols**: a mais forte, mas mais difícil de ditar por telefone.
   - **Random — letters and digits only**: forte, mais fácil de escrever.
   - **Words — easier to read aloud**: uma sequência de palavras fáceis de dizer em voz alta (ex: `river-cloud-stone-...-1234`).
4. Escolhe o **comprimento** da password (16, 24, 32 ou 40 — quanto maior, mais segura).
5. Clica em **🔒 Encrypt & download**.
6. Aparece um cartão verde com:
   - O botão para **descarregar o .zip**.
   - A **password gerada** — copia-a já (botão **📋 Copy**), porque **não fica guardada em lado nenhum**. Se a perderes, o ficheiro não pode ser recuperado.

## Muito importante

- **Envia a password por um canal diferente** do ficheiro (ex: ficheiro por email, password por SMS ou chat). Nunca as duas coisas juntas no mesmo email.
- O `.zip` gerado abre com 7-Zip, WinRAR, o Keka do Mac, ou qualquer programa que suporte encriptação AES do WinZip — não precisas de nenhum programa especial.
- Clicar em **Clear** apaga tudo o que preparaste e esquece a password mostrada.

## Nota técnica (para quem quiser saber)

Encriptação AES-256 (WinZip AE-2), com PBKDF2-HMAC-SHA1 e autenticação HMAC-SHA1 — o cifrador antigo e fraco (ZipCrypto) nunca é usado.
