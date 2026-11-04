import { describe, it, expect, beforeEach } from 'vitest';
import { ListSellerProductsUseCase } from '@/modules/products/application/list-seller-products.use-case';
import { InMemoryProductRepository } from '@tests/fakes/in-memory-product-repository';
import { ForbiddenError } from '@/shared/errors/app-error';

describe('RF-08: Listagem de Produtos do Vendedor (ListSellerProductsUseCase)', () => {
  let productRepo: InMemoryProductRepository;
  let useCase: ListSellerProductsUseCase;

  const sellerA = { id: 'seller-a', role: 'seller' };
  const sellerB = { id: 'seller-b', role: 'seller' };
  const buyer = { id: 'buyer-user', role: 'buyer' };

  beforeEach(async () => {
    productRepo = new InMemoryProductRepository();
    useCase = new ListSellerProductsUseCase(productRepo);

    // 2 produtos do Vendedor A
    await productRepo.create({
      sellerId: sellerA.id,
      title: 'Produto 1 do Vendedor A',
      description: 'Desc 1',
      priceInCents: 1000,
      stock: 1,
    });
    await productRepo.create({
      sellerId: sellerA.id,
      title: 'Produto 2 do Vendedor A',
      description: 'Desc 2',
      priceInCents: 2000,
      stock: 2,
    });

    // 1 produto do Vendedor B
    await productRepo.create({
      sellerId: sellerB.id,
      title: 'Produto do Vendedor B',
      description: 'Desc B',
      priceInCents: 3000,
      stock: 3,
    });
  });

  it('deve listar apenas os produtos pertencentes ao vendedor autenticado', async () => {
    // Por que esse teste importa? Garante isolamento na tela "Meus Produtos"
    const result = await useCase.execute(sellerA);

    expect(result.length).toBe(2);
    expect(result.every((p) => p.sellerId === sellerA.id)).toBe(true);
  });

  it('deve BLOQUEAR com ForbiddenError (403) se um comprador tentar acessar a lista de vendedor', async () => {
    await expect(useCase.execute(buyer)).rejects.toThrow(ForbiddenError);
  });
});

