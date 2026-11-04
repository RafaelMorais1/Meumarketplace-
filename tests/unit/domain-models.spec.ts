import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserRepository } from '../fakes/in-memory-user-repository';
import { InMemorySessionRepository } from '../fakes/in-memory-session-repository';
import { InMemoryProductRepository } from '../fakes/in-memory-product-repository';

describe('Modelo de Dados e Repositórios Base (Etapa C)', () => {
  let userRepo: InMemoryUserRepository;
  let sessionRepo: InMemorySessionRepository;
  let productRepo: InMemoryProductRepository;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    sessionRepo = new InMemorySessionRepository(userRepo);
    productRepo = new InMemoryProductRepository(userRepo);
  });

  it('deve persistir e recuperar um usuário pelo e-mail insensível a maiúsculas (RF-01)', async () => {
    const created = await userRepo.create({
      name: 'Vendedor Teste',
      email: 'Seller@Example.COM',
      passwordHash: 'hash-seguro-argon2',
      role: 'seller',
    });

    expect(created.id).toBeDefined();
    expect(created.email).toBe('seller@example.com');

    const found = await userRepo.findByEmail('SELLER@example.com');
    expect(found).not.toBeNull();
    expect(found?.name).toBe('Vendedor Teste');
  });

  it('deve vincular a sessão ao usuário e invalidar se expirada (RF-02, RF-03)', async () => {
    const user = await userRepo.create({
      name: 'Comprador Teste',
      email: 'buyer@example.com',
      passwordHash: 'hash-seguro',
      role: 'buyer',
    });

    // Sessão válida por 7 dias
    const validSession = await sessionRepo.create({
      userId: user.id,
      tokenHash: 'sha256-hash-do-token-valido',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    });

    const activeSession = await sessionRepo.findByTokenHash('sha256-hash-do-token-valido');
    expect(activeSession).not.toBeNull();
    expect(activeSession?.user.email).toBe('buyer@example.com');

    // Sessão expirada no passado
    await sessionRepo.create({
      userId: user.id,
      tokenHash: 'sha256-hash-expirado',
      expiresAt: new Date(Date.now() - 1000), // Expirou 1 segundo atrás
    });

    const expiredSession = await sessionRepo.findByTokenHash('sha256-hash-expirado');
    expect(expiredSession).toBeNull(); // Não deve retornar sessão expirada
  });

  it('deve salvar preços em centavos e paginar produtos corretamente (RF-09, RNF-06)', async () => {
    const seller = await userRepo.create({
      name: 'Loja Oficial',
      email: 'loja@exemplo.com',
      passwordHash: 'hash',
      role: 'seller',
    });

    // Cria 15 produtos
    for (let i = 1; i <= 15; i++) {
      await productRepo.create({
        sellerId: seller.id,
        title: `Produto ${i.toString().padStart(2, '0')}`,
        description: `Descrição do produto ${i}`,
        priceInCents: i * 1000, // ex: R$ 10,00, R$ 20,00...
        stock: 5,
      });
    }

    // Página 1 com 10 itens
    const page1 = await productRepo.listPublic({ page: 1, pageSize: 10 });
    expect(page1.total).toBe(15);
    expect(page1.totalPages).toBe(2);
    expect(page1.items.length).toBe(10);
    expect(page1.items[0].seller.name).toBe('Loja Oficial');

    // Página 2 com 5 itens restantes
    const page2 = await productRepo.listPublic({ page: 2, pageSize: 10 });
    expect(page2.items.length).toBe(5);

    // Busca por termo
    const searchResult = await productRepo.listPublic({ search: 'Produto 05' });
    expect(searchResult.total).toBe(1);
    expect(searchResult.items[0].title).toBe('Produto 05');
  });
});

