import { z } from 'zod';
import * as dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env local quando não estiver em produção
dotenv.config();

/**
 * Esquema de validação rigoroso para todas as variáveis de ambiente necessárias.
 * RNF-07: Configuração & Startup Fail-Fast
 * 
 * Por que isso é uma boa prática de engenharia sênior?
 * Se uma variável crítica estiver ausente ou incorreta (ex: DATABASE_URL mal formatada ou SESSION_SECRET muito curta),
 * a aplicação falha IMEDIATAMENTE durante o boot com uma mensagem de erro cristalina, em vez de subir
 * silenciosamente e quebrar no meio de uma requisição de um usuário real no meio da noite.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url('DATABASE_URL deve ser uma URL válida de conexão PostgreSQL'),
  DATABASE_URL_TEST: z.string().url('DATABASE_URL_TEST deve ser uma URL válida para testes').optional(),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET deve ter no mínimo 32 caracteres para garantir entropia criptográfica'),
});

// Fazemos o parse seguro; se falhar, formatamos o erro e interrompemos o processo
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Configuração inválida de variáveis de ambiente:');
  console.error(JSON.stringify(parsedEnv.error.format(), null, 2));
  throw new Error('Falha na inicialização do sistema devido a variáveis de ambiente inválidas ou ausentes.');
}

export const env = parsedEnv.data;

