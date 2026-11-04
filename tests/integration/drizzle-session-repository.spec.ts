import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { setupTestDatabase, cleanTestDatabase, closeTestDatabase, testDb } from '../helpers/test-db';
import { isPostgresRunning } from '../helpers/check-db';
import { DrizzleUserRepository } from '@/modules/users/infrastructure/drizzle-user.repository';
import { DrizzleSessionRepository } from '@/modules/auth/infrastructure/drizzle-session.repository';
import { users } from '@/infra/db/schema';
import { eq } from 'drizzle-orm';

describe('Integração: DrizzleSessionRepository contra PostgreSQL Real', () => {
  let dbAvailable = false;
  let userRepo: DrizzleUserRepository;
  let sessionRepo: DrizzleSessionRepository;

  beforeAll(async () => {
    dbAvailable = await isPostgresRunning();
    if (dbAvailable) {
      await setupTestDatabase();
      userRepo = new DrizzleUserRepository(testDb as any);
      sessionRepo = new DrizzleSessionRepository(testDb as any);
    }
  });

  beforeEach(async () => {
    if (dbAvailable) {
      await cleanTestDatabase();
    }
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it('deve registrar sessão e recuperar com JOIN do usuário autenticado (RF-02, ADR-003)', async (ctx) => {
    if (!dbAvailable) {
      ctx.skip();
      return;
    }

    const user = await userRepo.create({
      name: 'Maria Real',
      email: 'maria@real.com',
      passwordHash: 'hash',
      role: 'buyer',
    });

    const tokenHash = 'a'.repeat(64); // 64 hex chars
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await sessionRepo.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const sessionWithUser = await sessionRepo.findByTokenHash(tokenHash);
    expect(sessionWithUser).not.toBeNull();
    expect(sessionWithUser?.user.email).toBe('maria@real.com');
  });

  it('deve remover a sessão automaticamente quando o usuário é excluído (ON DELETE CASCADE)', async (ctx) => {
    if (!dbAvailable) {
      ctx.skip();
      return;
    }

    // Por que esse teste importa? Garante que o banco de dados limpa sessões órfãs via CASCADE
    const user = await userRepo.create({
      name: 'Usuario Efêmero',
      email: 'efemero@teste.com',
      passwordHash: 'hash',
      role: 'buyer',
    });

    const tokenHash = 'b'.repeat(64);
    await sessionRepo.create({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 1000 * 60),
    });

    // Deleta o usuário diretamente no PostgreSQL
    await (testDb as any).delete(users).where(eq(users.id, user.id));

    // A sessão deve ter desaparecido por cascata
    const session = await sessionRepo.findByTokenHash(tokenHash);
    expect(session).toBeNull();
  });
});

