import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/config/env';
import * as schema from './schema';

/**
 * Cliente de Conexão com o PostgreSQL
 * 
 * Por que usamos o driver `postgres` (postgres.js)?
 * É atualmente o driver mais rápido e leve para Node.js, com suporte nativo a ES Modules,
 * auto-reconnect, tratamento de tipos nativos (como Date e BigInt) e pooling de conexões eficiente.
 */

// Em ambiente de desenvolvimento e produção, mantemos um pool de conexões reutilizável
const connectionString = env.DATABASE_URL;

// Opções de conexão:
// max: número máximo de conexões simultâneas no pool
export const queryClient = postgres(connectionString, {
  max: env.NODE_ENV === 'production' ? 20 : 5,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(queryClient, { schema });

