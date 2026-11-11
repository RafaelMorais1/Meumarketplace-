import postgres from 'postgres';
import { env } from '@/config/env';

/**
 * Verifica se um banco de dados DEDICADO EXCLUSIVAMENTE para testes está ativo.
 * Regra de Segurança: NUNCA executa testes de integração contra o banco de desenvolvimento (DATABASE_URL),
 * para evitar que comandos TRUNCATE apaguem dados reais cadastrados pelo usuário.
 */
export async function isPostgresRunning(): Promise<boolean> {
  if (!env.DATABASE_URL_TEST) {
    return false;
  }

  const sql = postgres(env.DATABASE_URL_TEST, { connect_timeout: 2, max: 1 });
  try {
    await sql`SELECT 1`;
    await sql.end();
    return true;
  } catch {
    await sql.end().catch(() => {});
    return false;
  }
}

