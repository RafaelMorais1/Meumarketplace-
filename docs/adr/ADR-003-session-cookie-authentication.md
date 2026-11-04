# ADR-003: Autenticação Baseada em Sessões Stateful em Cookie HttpOnly com Hash no Banco

## Status
Aceito

## Contexto
O marketplace precisa autenticar usuários e aplicar controle de acesso por papel (`buyer` vs `seller`). Precisamos decidir entre:
1. Autenticação stateless via JSON Web Tokens (JWT) trafegados no header `Authorization` ou cookies.
2. Autenticação stateful baseada em tokens de sessão aleatórios persistidos em banco e transmitidos via cookies seguros `HttpOnly`.

Em sistemas de e-commerce e marketplace, eventos críticos de segurança ocorrem com frequência:
- Bloqueio imediato de contas fraudulentas.
- Revogação de permissões quando um vendedor é suspenso.
- Logout explícito em todos os dispositivos.

Com JWT stateless puro, revogar um token antes do seu tempo de expiração exige criar listas de revogação distribuídas (ex: Redis), anulando o principal benefício de ser "stateless".

## Decisão
Adotamos o padrão de **Sessões Stateful com Tokens de Alta Entropia**:
1. No login, um token criptograficamente seguro (256 bits, base64url) é gerado.
2. O servidor calcula o hash SHA-256 desse token e salva na tabela `sessions` com a data de expiração.
3. O token original em texto puro é enviado ao cliente em um cookie HTTP com as diretivas:
   - `HttpOnly = true` (inibe acesso via JavaScript, prevenindo ataques XSS).
   - `SameSite = Lax` (protege contra ataques Cross-Site Request Forgery - CSRF).
   - `Secure = true` em produção (somente tráfego HTTPS).
   - `Path = /`.
4. Em cada requisição protegida, o servidor pega o token do cookie, calcula o SHA-256 e busca a sessão no banco associada ao usuário.
5. No logout ou banimento, basta deletar o registro da tabela `sessions`, tornando a invalidação instantânea.

## Alternativas Consideradas
1. **JWT Stateless no LocalStorage:**
   - *Motivo da Rejeição:* Altamente vulnerável a XSS (qualquer script injetado rouba o token) e impossível de revogar imediatamente sem banco auxiliar.
2. **JWT em Cookie HttpOnly:**
   - *Motivo da Rejeição:* Embora resolva o risco de XSS, ainda sofre da incapacidade de revogação imediata caso o papel do usuário mude durante a sessão válida.

## Consequências
### Positivas:
- **Segurança Máxima:** Proteção nativa contra XSS (cookie inacessível via JS) e CSRF.
- **Revogação Instantânea:** Se a conta for alterada ou o usuário fizer logout, a sessão morre imediatamente.
- **Proteção contra Dump de Banco:** Se invasores extraírem a tabela `sessions`, só encontrarão hashes SHA-256, que não podem ser usados como tokens de cookie.

### Negativas / Riscos Mitigados:
- **Consulta ao Banco por Requisição:** Cada verificação de sessão requer um `SELECT` rápido indexado no Postgres.
  - *Mitigação:* A query é realizada por índice B-Tree primário/único (`token_hash`), executando em menos de 1ms. No roadmap futuro de alto tráfego, pode-se introduzir cacheamento via Redis.

