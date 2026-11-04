import { describe, it, expect, beforeEach } from 'vitest';
import { ListPublicProductsUseCase } from '@/modules/products/application/list-public-products.use-case';
import { InMemoryProductRepository } from '@tests/fakes/in-memory-product-repository';
import { InMemoryUserRepository } from '@tests/fakes/in-memory-user-repository';

describe('RF-09: Listagem Pública e Paginação (ListPublicProductsUseCase)', () => {
  let productRepo: InMemoryProductRepository;
  let userRepo: InMemoryUserRepository;
  let useCase: ListPublicProductsUseCase;

  beforeEach(async () => {
    userRepo = new InMemoryUserRepository();
    productRepo = new InMemoryProductRepository(userRepo);
    useCase = new ListPublicProductsUseCase(productRepo);

    // Cria vendedor base
    const seller = await userRepo.create({
      name: 'Tech Store Oficial',
      email: 'tech@store.com',
      passwordHash: 'hash',
      role: 'seller',
    });

    // Cria 25 produtos para testar paginação real
    for (let i = 1; i <= 25; i++) {
      await productRepo.create({
        sellerId: seller.id,
        title: `Item Tecnológico ${i.toString().padStart(2, '0')}`,
        description: `Descrição rica do item ${i}`,
        priceInCents: i * 5000,
        stock: i,
      });
    }
  });

  it('deve listar a primeira página com limite padrão e metadados de paginação (RF-09)', async () => {
    // Por que esse teste importa? Garante que clientes recebem o total de páginas e itens divididos
    const result = await useCase.execute({ page: 1, pageSize: 9 });

    expect(result.items.length).toBe(9);
    expect(result.total).toBe(25);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(9);
    expect(result.totalPages).toBe(3); // 25 itens / 9 por página = 3 páginas
    expect(result.items[0].seller.name).toBe('Tech Store Oficial');
  });

  it('deve listar a última página com os itens restantes', async () => {
    // Garante que o cálculo de offset não quebra na última página
    const result = await useCase.execute({ page: 3, pageSize: 9 });

    expect(result.items.length).toBe(7); // 9 + 9 + 7 = 25
    expect(result.page).toBe(3);
  });

  it('deve filtrar produtos por termo de busca insensível a maiúsculas (RF-09)', async () => {
    // Por que esse teste importa? Usuários buscam "item 05" ou "ITEM 05" e devem achar o mesmo resultado
    const result = await useCase.execute({ search: 'item tecnológico 05' });

    expect(result.total).toBe(1);
    expect(result.items[0].title).toBe('Item Tecnológico 05');
  });

  it('deve retornar lista vazia de forma amigável quando a busca não encontra correspondências', async () => {
    // Caso de borda: busca por produto inexistente não deve quebrar
    const result = await useCase.execute({ search: 'TermoInexistenteXYZ123' });

    expect(result.total).toBe(0);
    expect(result.items.length).toBe(0);
    expect(result.totalPages).toBe(1);
  });

  it('deve normalizar números de página negativos ou inválidos para 1', async () => {
    // Caso de borda: invasor tenta passar page=-1 ou page=0 na query string
    const result = await useCase.execute({ page: -5 });
    expect(result.page).toBe(1);
  });
});

