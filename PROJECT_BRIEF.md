# PROJECT BRIEF - Marketplace Web com Autenticação (MVP)

> Documento de referência do projeto e guia mestre de engenharia, arquitetura e aprendizado.
> **Instrução permanente:** Este arquivo deve ser lido e seguido em todas as sessões e etapas de desenvolvimento.

---

## 1. Papel e Filosofia de Trabalho
- **Engenheiro de Software Sênior & Mentor**: Construir uma base sólida com foco em qualidade, boas práticas e aprendizado contínuo.
- **Foco em Didática**: Não apenas entregar código, mas explicar os **porquês**, trade-offs, armadilhas e conceitos teóricos aplicados.
- **Linguagem**: Comunicação, documentação e comentários em **Português (do Brasil)**; nomes de código (variáveis, funções, tabelas, classes) em **Inglês**.
- **Ritmo de Execução**: Executar em etapas incrementais, pequenas e verificáveis. Pausar ao fim de cada etapa e só avançar após confirmação do usuário.

---

## 2. Objetivo & Escopo do MVP
Construir um **Monólito Modular** de marketplace funcional, seguro e testável com foco em qualidade sobre quantidade.

### Escopo Incluído (MVP)
1. **Autenticação e Sessão**: Cadastro, login, logout, sessão segura e proteção de rotas.
2. **Controle de Acesso Baseado em Papéis (RBAC)**:
   - `buyer`: navega, busca e visualiza produtos.
   - `seller`: cria, edita, lista e remove seus próprios produtos (e apenas os seus).
3. **Gestão de Produtos**: CRUD completo restrito ao vendedor proprietário.
4. **Listagem Pública**: Catálogo aberto com paginação e busca simples por título/nome.

### Fora de Escopo Inicial (Roadmap Futuro)
- Carrinho de compras, checkout, pagamentos (Stripe/Mercado Pago).
- Gestão de pedidos e estoque complexo.
- Upload real de imagens (S3/Cloudinary) — usar URLs ou placeholders no MVP.
- Avaliações/reviews e notificações.

---

## 3. Diretrizes de Arquitetura e Engenharia
- **Monólito Modular**: Fronteiras nítidas entre domínios (`auth`, `users`, `products`), preparando desacoplamento ou extração de microserviços futuros.
- **Separação em Camadas**:
  - *Apresentação*: UI / Server Actions / Rotas HTTP.
  - *Aplicação / Casos de Uso*: Regras de negócio puras (sem dependência de framework).
  - *Infraestrutura / Repositórios*: Acesso ao banco de dados, clientes externos.
  - **Regra de Ouro**: Regra de negócio NUNCA reside em componentes visuais ou handlers de rota.
- **Configuração e Segurança**:
  - Variáveis de ambiente validadas com Zod no bootstrap.
  - Senhas com hash criptográfico forte (`argon2` ou `bcrypt`).
  - Proteção contra OWASP Top 10 (CSRF, XSS, SQL Injection via ORM/Query Builder).
  - Rate limiting no login e rotas sensíveis.
  - Sanitização de logs (nunca logar senhas, tokens ou dados sensíveis).
  - Servidor stateless, paginação via cursor ou offset indexado, migrations versionadas.

---

## 4. Estratégia de Testes e Rastreabilidade
- **Diretriz Inegociável: Proibição Absoluta de Bypass em Testes**:
  - **NUNCA, em hipótese alguma, dar bypass, suprimir, comentar ou ignorar testes com `.skip` indevido.**
  - Sempre executar cada cenário e verificar detalhadamente os resultados (asserções, logs de erro, códigos de saída).
  - Se um teste falhar ou apresentar anomalias, a causa raiz DEVE ser investigada e corrigida na regra de negócio ou no adaptador com integridade técnica, NUNCA pulando ou mascarando o teste.
- **Pirâmide de Testes**:
  1. *Unitários*: Casos de uso e regras de negócio com repositórios mockados.
  2. *Integração*: Repositórios e migrations rodando contra PostgreSQL real em container isolado.
  3. *API/HTTP*: Endpoints/Server Actions de ponta a ponta (status code, payloads, autorização).
  4. *E2E (Playwright)*: Fluxos críticos (auth, criação e exibição de produto, bloqueio de permissão).
  5. *Segurança*: Testes negativos explícitos (401 sem auth, 403 para buyer criando produto, 403 para seller editando produto alheio).
- **Rastreabilidade Obrigatória**:
  - Todo teste deve referenciar o ID do requisito: ex.: `describe('RF-03: criar produto', ...)` ou `// RF-03`.
  - Matriz de rastreabilidade mantida em `docs/05-plano-de-testes.md`.
- **Casos de Borda**: Testar caminho feliz, erros mapeados e no mínimo um caso de borda em cada funcionalidade.

---

## 5. Estrutura de Documentação Obrigatória (`docs/`)
- `docs/01-requisitos.md`: Requisitos funcionais (RF-XX), não funcionais (RNF-XX), regras de negócio (RN-XX) e critérios de aceite.
- `docs/02-arquitetura.md`: Visão geral, diagramas Mermaid, camadas, ciclo de requisição.
- `docs/03-modelo-de-dados.md`: Diagrama ER Mermaid e detalhamento do esquema.
- `docs/adr/`: Architecture Decision Records (Contexto -> Decisão -> Alternativas -> Consequências).
- `docs/04-roadmap.md`: Próximas iterações pós-MVP.
- `docs/05-plano-de-testes.md`: Estratégia, comandos e matriz de rastreabilidade.
- `docs/06-roteiro-validacao.md`: Checklist de smoke test manual para o usuário testar.
- `docs/aprendizado/`: Guias curtos explicando conceitos-chave de arquitetura e computação.
- `README.md`: Instruções de inicialização rápida via Docker e execução de testes.

---

## 6. Fluxo de Trabalho por Etapas
1. **Perguntas Essenciais & Alinhamento**
2. **Plano de Execução & Confirmação**
3. **Etapa A**: Documentação inicial completa (`docs/01`, `docs/02`, ADRs, esqueleto de testes)
4. **Etapa B**: Setup técnico (Docker, ESLint/Prettier, TypeScript, validação env, framework de testes)
5. **Etapa C**: Modelo de dados, migrations e repositórios base
6. **Etapa D**: Autenticação, sessão e RBAC (com testes na etapa)
7. **Etapa E**: CRUD de Produtos (com testes na etapa)
8. **Etapa F**: Listagem pública, busca e paginação (com testes na etapa)
9. **Etapa G**: Consolidação de testes unitários e de integração
10. **Etapa H**: Testes de API e segurança / autorização
11. **Etapa I**: Testes E2E com Playwright + Pipeline CI (GitHub Actions)
12. **Etapa J**: Validação final, exercício de sabotagem didático e revisão de débitos

