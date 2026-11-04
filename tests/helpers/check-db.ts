import postgres from 'postgres';
import { env } from '@/config/env';

export async function isPostgresRunning(): Promise<boolean> {
  const sql = postgres(env.DATABASE_URL, { connect_timeout: 2, max: 1 });
  try {
    await sql`SELECT 1`;
    await sql.end();
    return true;
  } catch {
    await sql.end().catch(() => {});
    return false;
  }
}

