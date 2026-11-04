import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { env } from '@/config/env';
import path from 'path';

/**
 * Runner de Migrações do Banco de Dados
 * Executa as migrações SQL geradas pelo Drizzle Kit em ordem cronológica
 */
async function runMigrations() {
  console.log('🔄 Iniciando execução das migrações do PostgreSQL...');

  // Criamos uma conexão dedicada com max: 1 para rodar migrações de forma estritamente sequencial
  const migrationClient = postgres(env.DATABASE_URL, { max: 1 });
  const db = drizzle(migrationClient);

  try {
    const migrationsFolder = path.resolve(__dirname, './migrations');
    await migrate(db, { migrationsFolder });
    console.log('✅ Todas as migrações foram aplicadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro crítico ao executar migrações:', error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

// Executa se chamado diretamente via CLI
if (require.main === module || process.argv[1] === __filename) {
  runMigrations();
}

