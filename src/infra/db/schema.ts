import { pgTable, uuid, varchar, text, integer, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * Definição do Enum de Papéis do Usuário (RBAC)
 * RN-01: No MVP o papel é fixo no cadastro ('buyer' ou 'seller')
 */
export const userRoleEnum = pgEnum('user_role', ['buyer', 'seller']);

/**
 * Tabela de Usuários (RF-01, RF-02, RF-04)
 */
export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    role: userRoleEnum('role').notNull().default('buyer'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    // Índice B-Tree para buscas ultra-rápidas no momento do login
    emailIdx: index('idx_users_email').on(table.email),
  })
);

/**
 * Tabela de Sessões (RF-02, RF-03, RNF-02, ADR-003)
 * Armazena as sessões stateful com hash SHA-256 do token entregue via cookie
 */
export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }), // Se o usuário for excluído, todas as sessões caem
    tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    // Índice único para validação da sessão em cada requisição autenticada
    tokenHashIdx: index('idx_sessions_token_hash').on(table.tokenHash),
    // Índice para otimizar queries de limpeza periódica de sessões expiradas
    expiresAtIdx: index('idx_sessions_expires_at').on(table.expiresAt),
  })
);

/**
 * Tabela de Produtos (RF-05, RF-06, RF-07, RF-08, RF-09, RF-10)
 */
export const products = pgTable(
  'products',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sellerId: uuid('seller_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }), // Impede apagar vendedor com produtos vinculados
    title: varchar('title', { length: 160 }).notNull(),
    description: text('description').notNull(),
    priceInCents: integer('price_in_cents').notNull(), // RNF-06: Valor em centavos para evitar erros de float
    stock: integer('stock').notNull().default(0),
    imageUrl: varchar('image_url', { length: 500 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    // Índice para filtrar rapidamente os produtos pertencentes a um vendedor na área restrita
    sellerIdIdx: index('idx_products_seller_id').on(table.sellerId),
    // Índice para ordenação padrão da listagem pública (mais recentes primeiro)
    createdAtIdx: index('idx_products_created_at').on(table.createdAt),
    // Índice para busca pública por título
    titleIdx: index('idx_products_title').on(table.title),
  })
);

/**
 * Tabela de Tokens de Recuperação de Senha (RF-11, RF-12, ADR-005, RN-07)
 * Armazena o hash SHA-256 de tokens temporários de alta entropia
 */
export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }), // Se o usuário for excluído, os tokens de reset caem
    tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    // Índice único para validação instantânea do token enviado via link
    tokenHashIdx: index('idx_password_reset_tokens_token_hash').on(table.tokenHash),
    // Índice para localizar/invalidar tokens anteriores de um usuário
    userIdIdx: index('idx_password_reset_tokens_user_id').on(table.userId),
  })
);

// Definição das relações relacionais do Drizzle ORM (facilita consultas aninhadas)
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  products: many(products),
  passwordResetTokens: many(passwordResetTokens),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

export const productsRelations = relations(products, ({ one }) => ({
  seller: one(users, {
    fields: [products.sellerId],
    references: [users.id],
  }),
}));

// Export dos tipos inferidos diretamente do Schema (Zero duplicação de tipagem!)
export type UserTable = typeof users.$inferSelect;
export type NewUserTable = typeof users.$inferInsert;

export type SessionTable = typeof sessions.$inferSelect;
export type NewSessionTable = typeof sessions.$inferInsert;

export type PasswordResetTokenTable = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetTokenTable = typeof passwordResetTokens.$inferInsert;

export type ProductTable = typeof products.$inferSelect;
export type NewProductTable = typeof products.$inferInsert;

