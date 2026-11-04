# ADR-002: Adoção do PostgreSQL 16 com Drizzle ORM

## Status
Aceito

## Contexto
O marketplace requer persistência com garantias ACID fortes (integridade referencial entre produtos, usuários e sessões, transações financeiras e de estoque). Precisamos de um banco de dados relacional e de uma ferramenta de mapeamento/acesso a dados com excelente experiência em TypeScript.

## Decisão
Adotamos o **PostgreSQL 16** como banco de dados principal e o **Drizzle ORM** (em conjunto com o driver `postgres.js` e o gerador de migrações `drizzle-kit`).

## Alternativas Consideradas
1. **Prisma ORM:**
   - *Pontos Fortes:* Muito popular, schema centralizado simples de ler.
   - *Motivo da Rejeição:* O Prisma possui um binário Rust em tempo de execução que gera overhead de cold start em ambientes serverless, abstrai em excesso o SQL real gerado e possui limitações em queries complexas.
2. **TypeORM:**
   - *Motivo da Rejeição:* Baseado em decoradores legados do TypeScript, tipagem frágil comparada aos ORMs modernos, e histórico de bugs em migrações complexas.
3. **Kysely (Query Builder Puro):**
   - *Pontos Fortes:* SQL fortemente tipado e leve.
   - *Motivo da Rejeição:* Drizzle oferece uma experiência superior de definição de esquemas TypeScript compartilháveis e gerador automático de migrações SQL através do `drizzle-kit`, mantendo a mesma filosofia de proximidade ao SQL nativo.

## Consequências
### Positivas:
- **Zero Runtime Overhead:** Drizzle compila para queries SQL puras e diretas sem camadas pesadas de abstração.
- **Transparência de SQL:** O desenvolvedor entende exatamente as queries geradas, excelente para fins pedagógicos e depuração de performance.
- **Migrações em SQL Puro:** O `drizzle-kit` gera arquivos `.sql` versionados, que podem ser auditados facilmente e executados em qualquer ferramenta de CI/CD.

### Negativas / Riscos Mitigados:
- **Sintaxe mais próxima do SQL:** Exige compreensão básica de sintaxe relacional (JOINs, selects) ao invés da API orientada a objetos do Prisma.
  - *Benefício educacional:* Essa proximidade reforça as boas práticas de modelagem de dados e análise de planos de execução.

