# Marketplace Web com Autenticação (MVP)

Um monólito modular em TypeScript construído com foco em qualidade de software, boas práticas de engenharia e aprendizado contínuo.

---

## 📚 Documentação do Projeto

Toda a documentação viva, decisões técnicas e conceitos teóricos residem na pasta [`docs/`](file:///c:/Users/rafael.morais/Novo%20projeto/docs):

- [01 - Especificação de Requisitos e Regras de Negócio](file:///c:/Users/rafael.morais/Novo%20projeto/docs/01-requisitos.md) (RFs, RNFs, Regras de Negócio)
- [02 - Arquitetura de Software](file:///c:/Users/rafael.morais/Novo%20projeto/docs/02-arquitetura.md) (Monólito Modular, Camadas, Diagramas Mermaid)
- [03 - Modelo de Dados e Esquema Relacional](file:///c:/Users/rafael.morais/Novo%20projeto/docs/03-modelo-de-dados.md) (Tabelas, Tipos, Índices e Diagrama ER)
- [04 - Roadmap do Projeto](file:///c:/Users/rafael.morais/Novo%20projeto/docs/04-roadmap.md) (Evolução pós-MVP)
- [05 - Estratégia de Testes e Matriz de Rastreabilidade](file:///c:/Users/rafael.morais/Novo%20projeto/docs/05-plano-de-testes.md) (Pirâmide de testes e mapeamento de RFs)
- [06 - Roteiro de Validação Manual (Smoke Test)](file:///c:/Users/rafael.morais/Novo%20projeto/docs/06-roteiro-validacao.md) (Checklist de homologação)
- [Decisões de Arquitetura (ADRs)](file:///c:/Users/rafael.morais/Novo%20projeto/docs/adr) (ADR-001 a ADR-004)
- [Pílulas de Aprendizado](file:///c:/Users/rafael.morais/Novo%20projeto/docs/aprendizado) (Monólito modular, sessões seguras, Argon2id)

---

## 🛠️ Stack Tecnológica

- **Linguagem & Plataforma:** Node.js 20+ com TypeScript (Strict Mode)
- **Framework Web:** Next.js (App Router, Server Actions, Route Handlers)
- **Estilização:** Tailwind CSS
- **Banco de Dados & ORM:** PostgreSQL 16 + Drizzle ORM (`postgres.js` driver)
- **Criptografia & Validação:** Argon2id + Zod
- **Testes:** Vitest (Unitários e Integração) + Playwright (E2E)
- **Infraestrutura Local:** Docker Compose

---

## 🚀 Como Rodar Localmente (Em Breve após Etapa B)

```bash
# 1. Subir o banco de dados PostgreSQL
docker compose up -d

# 2. Instalar dependências
npm install

# 3. Executar as migrações do banco
npm run db:migrate

# 4. Iniciar o servidor de desenvolvimento
npm run dev
```

---

## 🧪 Como Rodar os Testes

```bash
npm run test            # Executa todos os testes unitários e de integração
npm run test:unit       # Executa testes unitários rápidos em memória
npm run test:integration# Executa testes de repositório contra Postgres real
npm run test:e2e        # Executa testes de ponta a ponta com Playwright
npm run test:coverage   # Exibe relatório de cobertura de código
```

