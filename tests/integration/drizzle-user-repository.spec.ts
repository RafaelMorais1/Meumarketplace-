import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { setupTestDatabase, cleanTestDatabase, closeTestDatabase, testDb } from '../helpers/test-db';
import { isPostgresRunning } from '../helpers/check-db';
import { DrizzleUserRepository } from '@/modules/users/infrastructure/drizzle-user.repository';

describe('Integração: DrizzleUserRepository contra PostgreSQL Real', () => {
  let dbAvailable = false;
  let repo: DrizzleUserRepository;

  beforeAll(async () => {
    dbAvailable = await isPostgresRunning();
    if (dbAvailable) {
      await setupTestDatabase();
      repo = new DrizzleUserRepository(testDb as any);
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

  it('deve persistir um usuário no PostgreSQL e recuperar pelo e-mail insensível a maiúsculas (RF-01)', async (ctx) => {
    if (!dbAvailable) {
      ctx.skip();
      return;
    }

    const created = await repo.create({
      name: 'João Vendedor Real',
      email: 'joao.real@exemplo.com',
      passwordHash: 'hash-argon2-valido',
      role: 'seller',
    });

    expect(created.id).toBeDefined();
    expect(created.email).toBe('joao.real@exemplo.com');

    // Busca com variação de maiúsculas no banco real
    const found = await repo.findByEmail('JOAO.REAL@EXEMPLO.COM');
    expect(found).not.toBeNull();
    expect(found?.name).toBe('João Vendedor Real');
    expect(found?.role).toBe('seller');
  });

  it('deve rejeitar e-mail duplicado respeitando a constraint UNIQUE do Postgres (RF-01)', async (ctx) => {
    if (!dbAvailable) {
      ctx.skip();
      return;
    }

    await repo.create({
      name: 'Primeiro',
      email: 'unico@exemplo.com',
      passwordHash: 'hash',
      role: 'buyer',
    });

    // Tentativa de duplicar e-mail no PostgreSQL real
    await expect(
      repo.create({
        name: 'Segundo',
        email: 'unico@exemplo.com',
        passwordHash: 'hash2',
        role: 'buyer',
      })
    ).rejects.toThrow();
  });
});

