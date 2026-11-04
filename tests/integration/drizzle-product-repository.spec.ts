import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { setupTestDatabase, cleanTestDatabase, closeTestDatabase, testDb } from '../helpers/test-db';
import { isPostgresRunning } from '../helpers/check-db';
import { DrizzleUserRepository } from '@/modules/users/infrastructure/drizzle-user.repository';
import { DrizzleProductRepository } from '@/modules/products/infrastructure/drizzle-product.repository';
import { users } from '@/infra/db/schema';
import { eq } from 'drizzle-orm';

describe('Integração: DrizzleProductRepository contra PostgreSQL Real', () => {
  let dbAvailable = false;
  let userRepo: DrizzleUserRepository;
  let productRepo: DrizzleProductRepository;

  beforeAll(async () => {
    dbAvailable = await isPostgresRunning();
    if (dbAvailable) {
      await setupTestDatabase();
      userRepo = new DrizzleUserRepository(testDb as any);
      productRepo = new DrizzleProductRepository(testDb as any);
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

  it('deve criar produto, paginar e buscar via ILIKE no PostgreSQL real (RF-05, RF-09)', async (ctx) => {
    if (!dbAvailable) {
      ctx.skip();
      return;
    }

    const seller = await userRepo.create({
      name: 'Vendedor Integrado',
      email: 'integrado@teste.com',
      passwordHash: 'hash',
      role: 'seller',
    });

    await productRepo.create({
      sellerId: seller.id,
      title: 'Placa de Vídeo RTX 4070',
      description: 'GPU de 12GB GDDR6X',
      priceInCents: 420000,
      stock: 5,
    });

    await productRepo.create({
      sellerId: seller.id,
      title: 'Processador Ryzen 7',
      description: 'CPU 8 núcleos 16 threads',
      priceInCents: 180000,
      stock: 8,
    });

    // Busca insensível a maiúsculas no banco real
    const searchResult = await productRepo.listPublic({ search: 'rtx 4070' });
    expect(searchResult.total).toBe(1);
    expect(searchResult.items[0].title).toBe('Placa de Vídeo RTX 4070');
    expect(searchResult.items[0].seller.name).toBe('Vendedor Integrado');
  });

  it('deve PROIBIR a exclusão do usuário vendedor se ele tiver produtos cadastrados (ON DELETE RESTRICT)', async (ctx) => {
    if (!dbAvailable) {
      ctx.skip();
      return;
    }

    // Por que esse teste importa? Garante integridade referencial: não podemos ter produtos órfãos
    const seller = await userRepo.create({
      name: 'Vendedor com Produtos',
      email: 'com.produtos@teste.com',
      passwordHash: 'hash',
      role: 'seller',
    });

    await productRepo.create({
      sellerId: seller.id,
      title: 'Produto Protegido',
      description: 'Descrição',
      priceInCents: 1000,
      stock: 1,
    });

    // Tentar deletar o usuário no banco deve lançar erro de Foreign Key Violation (código Postgres 23503)
    await expect(
      (testDb as any).delete(users).where(eq(users.id, seller.id))
    ).rejects.toThrow();
  });
});

