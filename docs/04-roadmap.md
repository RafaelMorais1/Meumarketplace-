# 04 - Roadmap do Projeto

Este documento registra as funcionalidades e melhorias arquiteturais planejadas para as iterações posteriores à conclusão e validação do MVP.

---

## Fase 1: MVP Funcional (Escopo Concluído e Homologado)
- [x] Especificação e arquitetura modular documentada
- [x] Setup de ambiente local com Docker e automação de testes
- [x] Modelo relacional no Postgres com Drizzle ORM e migrações
- [x] Autenticação stateful segura com Argon2id e controle de acesso RBAC (`buyer` / `seller`)
- [x] CRUD completo de produtos para vendedores com isolamento estrito
- [x] Catálogo público de produtos com paginação e busca simples
- [x] Pirâmide de testes completa (Unitários, Integração, E2E com Playwright)
- [x] Pipeline de CI no GitHub Actions

## Fase 1.1: Recuperação de Conta e Segurança Aprimorada (Em Andamento)
- [ ] **Recuperação de Senha Segura (OWASP ASVS):**
  - Solicitação de redefinição via e-mail com resposta anti-enumeração de usuários (RF-11).
  - Tabela `password_reset_tokens` com hash SHA-256 em repouso e expiração de 30 minutos (ADR-005).
  - Redefinição de senha com validação de uso único e regras de complexidade (RF-12, RN-07).
  - Revogação imediata de todas as sessões ativas do usuário após redefinição (RN-08).
  - Interface desacoplada `EmailService` (console em dev, expansível para Resend/SES).

---

## Fase 2: Mídia e Experiência de Catálogo
- [ ] **Upload Real de Imagens:**
  - Armazenamento em bucket compatível com S3 (Cloudflare R2 ou AWS S3).
  - Geração de URLs pré-assinadas (*presigned URLs*) no backend para upload direto do browser, aliviando o tráfego do servidor web.
  - Redimensionamento e otimização automática de imagens (WebP/AVIF).
- [ ] **Busca Avançada & Filtros:**
  - Busca fonética e trigramas via extensão `pg_trgm` do PostgreSQL.
  - Filtros dinâmicos por faixa de preço, estoque disponível e ordenação (menor preço, maior preço, mais recentes).
- [ ] **Categorias e Tags:**
  - Modelagem de categorias com hierarquia em árvore e relacionamento N:N com produtos.

---

## Fase 3: Transações Comerciais (Carrinho e Pedidos)
- [ ] **Carrinho de Compras:**
  - Carrinho temporário para visitantes e sincronização persistida no banco após o login.
  - Validação de estoque concorrente em tempo real.
- [ ] **Checkout e Máquina de Estados de Pedidos:**
  - Entidades `orders` e `order_items` com snapshot do preço histórico do produto no instante da compra.
  - Estados do pedido: `PENDING` → `AWAITING_PAYMENT` → `PAID` → `SHIPPED` → `DELIVERED` → `CANCELED`.
- [ ] **Integração de Pagamento:**
  - Integração com Stripe ou Mercado Pago (Pix e Cartão de Crédito).
  - Processamento assíncrono e idempotente de Webhooks de confirmação de pagamento.

---

## Fase 4: Confiança, Reputação e Administração
- [ ] **Avaliações e Reviews:**
  - Sistema de avaliação por estrelas (1 a 5) e comentários, permitido apenas para compradores verificados que adquiriram o item.
- [ ] **Painel Administrativo (`admin`):**
  - Papel de administrador do marketplace para moderação de conteúdo, suspensão de vendedores fraudulentos e métricas de volume transacionado (GMV).
- [ ] **Notificações Transacionais:**
  - Disparo de e-mails de confirmação de compra, envio de produto e recuperação de senha via Resend ou Amazon SES.

