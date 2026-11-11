import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import path from 'path';
import { env } from '@/config/env';
import * as schema from '@/infra/db/schema';
import { isPostgresRunning } from './check-db';

// Segurança de Dados: Testes NUNCA devem rodar contra o banco principal/desenvolvimento
const testDbUrl = env.DATABASE_URL_TEST || 'postgres://postgres:postgres@localhost:5433/marketplace_test';

export const testSql = postgres(testDbUrl, { max: 1 });
export const testDb = drizzle(testSql, { schema });

export async function setupTestDatabase() {
  const isUp = await isPostgresRunning();
  if (!isUp) {
    return false;
  }

  // Executa as migrações no banco de testes
  const migrationsFolder = path.resolve(__dirname, '../../src/infra/db/migrations');
  await migrate(testDb, { migrationsFolder });
  return true;
}

export async function cleanTestDatabase() {
  const isUp = await isPostgresRunning();
  if (!isUp) return;

  await testSql`TRUNCATE TABLE "products", "sessions", "users" CASCADE`;
}

export async function closeTestDatabase() {
  await testSql.end().catch(() => { });
}

