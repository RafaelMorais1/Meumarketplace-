# Aprendizado: Migrações de Banco de Dados e Drizzle Kit

## O Que é uma Migração de Banco de Dados?

Em projetos de software com múltiplos desenvolvedores ou múltiplos ambientes (desenvolvimento, homologação, produção), o esquema do banco de dados (tabelas, colunas, índices, foreign keys) muda constantemente conforme novas funcionalidades são criadas.

Se as alterações fossem feitas manualmente rodando SQL no cliente gráfico (ex: DBeaver ou PgAdmin):
- Ninguém saberia em que versão o banco de um ambiente está.
- O deploy em produção falharia porque alguém esqueceu de rodar o `ALTER TABLE` lá.
- Novos desenvolvedores precisariam de dumps manuais para começar a trabalhar.

Uma **Migração** é uma alteração de esquema **versionada em código** e executada de forma estritamente sequencial.

---

## Como o Drizzle Kit Trabalha

O Drizzle Kit compara o código TypeScript definido em `src/infra/db/schema.ts` com o histórico de migrações gerado na pasta `src/infra/db/migrations/`:

```text
schema.ts (Código TypeScript) 
      ⬇ (drizzle-kit generate)
0000_init.sql (Arquivo SQL puro com CREATE TABLE, CREATE INDEX)
      ⬇ (npm run db:migrate)
PostgreSQL Database (Aplica as alterações e registra o hash na tabela de controle)
```

### Por que Migrações em SQL Puro são uma Vantagem do Drizzle?
Diferente de ferramentas que escondem o SQL sob abstrações binárias, o Drizzle gera arquivos `.sql` legíveis. Isso permite que você:
1. Revise exatamente o SQL que será executado no banco antes de aplicar (`git diff`).
2. Entenda a sintaxe dos índices (`CREATE INDEX "idx_products_seller_id" ON "products" ("seller_id")`).
3. Adicione comandos avançados do Postgres quando necessário (ex: extensões, triggers, regras customizadas).

