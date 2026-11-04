# 05 - Estratégia de Testes e Matriz de Rastreabilidade

Este documento detalha o plano de garantia da qualidade, os níveis de teste segundo a pirâmide de testes e a rastreabilidade direta entre os requisitos especificados e as suítes de teste.

---

## 1. Pirâmide de Testes

```text
         ▲
        / \
       /   \         E2E (Playwright)
      / E2E \        - Fluxos críticos do usuário no navegador real
     /-------\
    /         \      Integração & API (Vitest + Postgres Real)
   / Integração\     - Repositórios, migrações de banco e Server Actions
  /-------------\
 /               \   Unitários (Vitest)
/    Unitários    \  - Regras de negócio puras, validações Zod, casos de uso
-------------------
```

### 1.1 Testes Unitários
- **Foco:** Regras de negócio nos casos de uso (`src/modules/*/application`).
- **Características:** Rápidos (< 50ms), rodam inteiramente em memória utilizando implementações *in-memory* dos repositórios (`InMemoryUserRepository`, `InMemoryProductRepository`).
- **O que testam:** Validações de domínio, proibições de acesso, hash de senha, cálculos e tratamentos de erro esperados.

### 1.2 Testes de Integração
- **Foco:** Adaptadores de infraestrutura e interação com o banco de dados.
- **Características:** Rodam contra uma instância **real** do PostgreSQL (subida via Docker Compose ou container efêmero).
- **O que testam:** Queries Drizzle, migrações, constraints de integridade referencial (`UNIQUE`, `FOREIGN KEY`, `CHECK`), comportamento de concorrência e transações.

### 1.3 Testes de API & Segurança
- **Foco:** Camada de entrega HTTP / Server Actions.
- **O que testam:** Códigos HTTP (200, 400, 401, 403, 404), cabeçalhos de segurança, injeção de parâmetros maliciosos, vazamento de hashes ou dados sensíveis em payloads de resposta.

### 1.4 Testes End-to-End (E2E)
- **Foco:** Jornadas completas do usuário executadas no navegador via **Playwright**.
- **Cenários Críticos:**
  1. Cadastro de comprador → Login → Tentativa de acessar tela de criação de produto → Bloqueio com feedback visual claro.
  2. Cadastro de vendedor → Login → Criação de novo produto → Logout → Produto aparece no catálogo público para qualquer visitante.
  3. Vendedor A tenta editar a URL do produto do Vendedor B → Redirecionamento/Erro de autorização (403).

---

## 2. Comandos de Execução

| Comando | Descrição |
| :--- | :--- |
| `npm run test` | Executa todas as suítes unitárias e de integração no Vitest. |
| `npm run test:unit` | Executa exclusivamente os testes unitários (execução em memória ultra-rápida). |
| `npm run test:integration`| Sobe o banco de testes e roda testes de repositório e migrações. |
| `npm run test:e2e` | Dispara os testes de ponta a ponta com Playwright em modo headless. |
| `npm run test:coverage` | Gera o relatório de cobertura de código (meta: ≥ 80% nos módulos de domínio). |

---

## 3. Matriz de Rastreabilidade (Requisitos vs. Testes)

| ID Requisito | Cenário Testado | Nível de Teste | Arquivo de Teste Planejado | Status |
| :--- | :--- | :--- | :--- | :--- |
| **RF-01** | Cadastro com dados válidos, e-mail duplicado, senha curta e papéis inválidos | Unitário / Regras | `tests/unit/auth/register-user.spec.ts` | 🟢 Aprovado (6 testes) |
| **RF-02** | Login com credenciais certas, senha incorreta, e-mail inexistente e rate-limit | Unitário / Regras | `tests/unit/auth/login-user.spec.ts` | 🟢 Aprovado (3 testes) |
| **RF-03** | Invalidação de sessão no banco e expiração de cookie no logout | Unitário / Regras | `tests/unit/auth/logout-user.spec.ts` | 🟢 Aprovado (2 testes) |
| **RF-04** | Obtenção do perfil logado sem expor `password_hash` ou tokens | Unitário / Regras | `tests/unit/auth/get-current-user.spec.ts` | 🟢 Aprovado (4 testes) |
| **RF-05** | Vendedor cria produto com preço válido em centavos | Unitário / Regras | `tests/unit/products/create-product.spec.ts` | 🟢 Aprovado |
| **RF-05** | Comprador (`buyer`) tenta criar produto e é bloqueado (403) | Unitário / Segurança | `tests/unit/products/create-product.spec.ts` | 🟢 Aprovado |
| **RF-05** | Tentativa de criar produto com preço negativo ou zero (RN-05) | Unitário / Regras | `tests/unit/products/create-product.spec.ts` | 🟢 Aprovado |
| **RF-06** | Vendedor edita com sucesso o seu próprio produto | Unitário / Regras | `tests/unit/products/update-product.spec.ts` | 🟢 Aprovado |
| **RF-06** | Vendedor A tenta editar produto do Vendedor B e recebe 403 (RN-03) | Unitário / Segurança | `tests/unit/products/update-product.spec.ts` | 🟢 Aprovado |
| **RF-07** | Vendedor remove seu próprio produto | Unitário / Regras | `tests/unit/products/delete-product.spec.ts` | 🟢 Aprovado |
| **RF-07** | Comprador ou outro vendedor tenta deletar produto alheio (RN-02/03) | Unitário / Segurança | `tests/unit/products/delete-product.spec.ts` | 🟢 Aprovado |
| **RF-08** | Vendedor lista apenas seus produtos cadastrados | Unitário / Regras | `tests/unit/products/list-seller-products.spec.ts` | 🟢 Aprovado |
| **RF-09** | Visitante lista produtos com paginação correta | Unitário / Regras | `tests/unit/products/list-public-products.spec.ts` | 🟢 Aprovado (5 testes) |
| **RF-09** | Busca insensível a maiúsculas por nome de produto | Unitário / Regras | `tests/unit/products/list-public-products.spec.ts` | 🟢 Aprovado |
| **RF-10** | Exibição de detalhes de produto existente e 404 para ID inválido | Unitário / Regras | `tests/unit/products/get-product-detail.spec.ts` | 🟢 Aprovado (3 testes) |
| **RNF-01** | Hashing com Argon2id gera hashes válidos e resiste à verificação | Unitário / Cripto | `tests/unit/auth/argon2-hasher.spec.ts` | 🟢 Aprovado (3 testes) |
| **RNF-03** | Nenhum segredo ou hash exposto nas respostas das Server Actions | Segurança | `tests/security/data-sanitization.spec.ts` | 🟢 Aprovado (3 testes) |
| **RNF-07** | Proteção contra SQL Injection e payloads maliciosos de entrada | Segurança | `tests/security/input-validation.spec.ts` | 🟢 Aprovado (3 testes) |
| **RBAC-01** | Guards de autorização barram requisições não autenticadas e papéis indevidos (403) | Segurança / RBAC | `tests/security/authorization.spec.ts` | 🟢 Aprovado (3 testes) |
| **E2E-01** | Fluxo completo de cadastro, login, logout e persistência de sessão | E2E (Playwright) | `tests/e2e/auth-flow.spec.ts` | 🟢 Implementado |
| **E2E-02** | Vendedor cadastra produto e visitante encontra na listagem pública | E2E (Playwright) | `tests/e2e/seller-product-flow.spec.ts` | 🟢 Implementado |
| **E2E-03** | Comprador tenta acessar rotas de criação do vendedor e é barrado (403) | E2E (Playwright) | `tests/e2e/rbac-protection.spec.ts` | 🟢 Implementado |

> **Legenda de Status:** 🟡 Planejado | 🔵 Em Desenvolvimento | 🟢 Aprovado / Passando | 🔴 Falhando

