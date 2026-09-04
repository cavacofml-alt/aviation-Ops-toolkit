# Manual — Secure ZIP

O que faz: pega em ficheiros (ou texto) e devolve-te um `.zip` encriptado com uma password forte gerada automaticamente. Tudo acontece no teu browser — nada é enviado para lado nenhum.

## Passo a passo

1. Abre a ferramenta **Secure ZIP**.
2. Junta o que queres proteger:
   - **Anexar ficheiros**: clica em **📎 Attach files** e escolhe um ou vários ficheiros do computador (limite: 64 MB por ficheiro, 128 MB no total).
   - **Colar texto**: escreve ou cola o texto na caixa "Or paste text", dá-lhe um nome de ficheiro (ex: `mensagem.txt`) e clica em **+ Add as file**.
   - Podes repetir e juntar vários ficheiros e/ou textos ao mesmo pacote — todos aparecem numa lista, com opção de remover cada um (✕).
3. Escolhe o **formato de encriptação** em "Encryption":
   - **ZipCrypto** (por defeito): abre em qualquer lado, incluindo o "Extrair tudo" do Windows, sem instalar nada. **É encriptação fraca** — quem tiver parte do conteúdo original de um ficheiro consegue recuperar o resto sem descobrir a password. Serve para manter um documento longe de um curioso, não para dados pessoais ou sensíveis.
   - **AES-256**: encriptação forte a sério, mas o Explorador do Windows não a consegue abrir — quem receber precisa de 7-Zip, WinRAR ou Keka.
4. Escolhe o **estilo da password** em "Password":
   - **Random — letters, digits, symbols**: a mais forte, mas mais difícil de ditar por telefone.
   - **Random — letters and digits only**: forte, mais fácil de escrever.
   - **Words — easier to read aloud**: uma sequência de palavras fáceis de dizer em voz alta (ex: `river-cloud-stone-...-1234`).
5. Escolhe o **comprimento** da password (16, 24, 32 ou 40 — vem 24 por defeito; quanto maior, mais segura).
6. Clica em **🔒 Encrypt & download**.
7. Aparece um cartão verde com:
   - O botão para **descarregar o .zip**.
   - A **password gerada** — copia-a já (botão **📋 Copy**), porque **não fica guardada em lado nenhum**. Se a perderes, o ficheiro não pode ser recuperado.

## Muito importante

- **Envia a password por um canal diferente** do ficheiro (ex: ficheiro por email, password por SMS ou chat). Nunca as duas coisas juntas no mesmo email.
- Um `.zip` **ZipCrypto** abre em qualquer lado, incluindo o "Extrair tudo" do Windows.
- Um `.zip` **AES-256** precisa de 7-Zip, WinRAR ou Keka — o Explorador do Windows dá o erro "Não foi possível criar o ficheiro de destino", porque não suporta AES.
- Clicar em **Clear** apaga tudo o que preparaste e esquece a password mostrada.

## Nota técnica (para quem quiser saber)

- **ZipCrypto**: a encriptação original do formato ZIP (PKWARE). Universalmente suportada, mas vulnerável a ataque de texto conhecido — algumas centenas de bytes conhecidos de um ficheiro chegam para recuperar o resto, sem sequer descobrir a password.
- **AES-256** (WinZip AE-2): PBKDF2-HMAC-SHA1 com 1000 iterações, salt de 16 bytes e autenticação HMAC-SHA1. Sem essa fraqueza.
