# Marketplace Web com Autenticação (MVP)

Um monólito modular em TypeScript construído com foco em qualidade de software, boas práticas de engenharia e aprendizado contínuo.

---

## 📚 Documentação do Projeto

Toda a documentação viva, decisões técnicas e conceitos teóricos residem na pasta [`docs/`](file:///c:/Users/rafael.morais/Novo%20projeto/docs):

- [01 - Especificação de Requisitos e Regras de Negócio](file:///c:/Users/rafael.morais/Novo%20projeto/docs/01-requisitos.md) (RFs, RNFs, Regras de Negócio)
- [02 - Arquitetura de Software](file:///c:/Users/rafael.morais/Novo%20projeto/docs/02-arquitetura.md) (Monólito Modular, Camadas, Diagramas Mermaid)
- [03 - Modelo de Dados e Esquema Relacional](file:///c:/Users/rafael.morais/Novo%20projeto/docs/03-modelo-de-dados.md) (Tabelas, Tipos, Índices e Diagrama ER)
- [04 - Roadmap do Projeto](file:///c:/Users/rafael.morais/Novo%20projeto/docs/04-roadmap.md) (Evolução pós-MVP: Checkout, Upload S3, Reviews)
- [05 - Estratégia de Testes e Matriz de Rastreabilidade](file:///c:/Users/rafael.morais/Novo%20projeto/docs/05-plano-de-testes.md) (Pirâmide de testes e 100% de cobertura de requisitos)
- [06 - Roteiro de Validação Manual (Smoke Test)](file:///c:/Users/rafael.morais/Novo%20projeto/docs/06-roteiro-validacao.md) (Checklist de homologação com 12 passos)
- [07 - Política de Branches e Versionamento](file:///c:/Users/rafael.morais/Novo%20projeto/docs/07-politica-de-branches.md) (Proibição de commits diretos na main, convenções semânticas e PRs)
- [Decisões de Arquitetura (ADRs)](file:///c:/Users/rafael.morais/Novo%20projeto/docs/adr) (ADR-001 a ADR-005)
- [Pílulas de Aprendizado](file:///c:/Users/rafael.morais/Novo%20projeto/docs/aprendizado) (Monólito modular, sessões seguras, Argon2id, Fail-Fast, Migrações, Gestão de Segredos)

---

## 🛠️ Stack Tecnológica

- **Linguagem & Runtime:** Node.js 20+ com TypeScript (Strict Mode)
- **Framework Web:** Next.js 14 (App Router, Server Actions, Route Handlers)
- **Estilização:** Tailwind CSS
- **Banco de Dados & ORM:** PostgreSQL 16 + Drizzle ORM (`postgres.js` driver + `drizzle-kit`)
- **Criptografia & Validação:** Argon2id (`@node-rs/argon2`) + Zod
- **Testes:** Vitest (Unitários, Integração e Segurança) + Playwright (E2E)
- **Infraestrutura Local & CI:** Docker Compose + GitHub Actions

---

## 🚀 Como Rodar o Projeto Localmente

```bash
# 1. Subir o banco de dados PostgreSQL via Docker Compose
docker compose up -d

# 2. Instalar as dependências do projeto
npm install

# 3. Executar as migrações SQL no banco
npm run db:migrate

# 4. Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🧪 Como Rodar os Testes

> ⚠️ **Política Inegociável de Testes (Zero Bypass):**
> Nunca, em hipótese alguma, dê bypass ou ignore testes no projeto. Sempre execute cada cenário de teste e verifique detalhadamente os resultados. Se um teste falhar, investigue e corrija a causa raiz no código ou no adaptador com integridade técnica. Consulte [05 - Estratégia de Testes](file:///c:/Users/rafael.morais/Novo%20projeto/docs/05-plano-de-testes.md) para diretrizes completas.

```bash
# Executa todos os testes unitários, de integração e de segurança
npm run test

# Executa exclusivamente os testes unitários rápidos em memória (~200ms)
npm run test:unit

# Executa os testes de integração contra o banco de dados PostgreSQL
npm run test:integration

# Executa os testes focados em autorização, RBAC e sanitização de dados
npm run test:security

# Gera o relatório oficial de cobertura de código (V8 - 99.14% nas regras de negócio)
npm run test:coverage

# Executa os testes End-to-End no navegador via Playwright
npm run test:e2e
```
