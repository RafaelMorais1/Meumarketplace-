import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteProductUseCase } from '@/modules/products/application/delete-product.use-case';
import { InMemoryProductRepository } from '@tests/fakes/in-memory-product-repository';
import { ForbiddenError, NotFoundError } from '@/shared/errors/app-error';

describe('RF-07: Exclusão de Produto (DeleteProductUseCase)', () => {
  let productRepo: InMemoryProductRepository;
  let useCase: DeleteProductUseCase;

  const sellerA = { id: 'seller-a', role: 'seller' };
  const sellerB = { id: 'seller-b', role: 'seller' };

  let product: any;

  beforeEach(async () => {
    productRepo = new InMemoryProductRepository();
    useCase = new DeleteProductUseCase(productRepo);

    product = await productRepo.create({
      sellerId: sellerA.id,
      title: 'Monitor 4K',
      description: 'Monitor Ultra HD 32 polegadas',
      priceInCents: 250000,
      stock: 5,
    });
  });

  it('deve permitir que o vendedor proprietário remova seu produto (RF-07)', async () => {
    // Por que esse teste importa? Garante que o dono do anúncio consegue tirá-lo do catálogo
    await useCase.execute(product.id, sellerA);

    expect(productRepo.products.length).toBe(0);
    const found = await productRepo.findById(product.id);
    expect(found).toBeNull();
  });

  it('deve BLOQUEAR com ForbiddenError (403) se outro vendedor tentar excluir o produto (RN-03)', async () => {
    // Previne exclusão não autorizada por concorrentes
    await expect(useCase.execute(product.id, sellerB)).rejects.toThrow(ForbiddenError);

    // O produto continua existindo no banco
    expect(productRepo.products.length).toBe(1);
  });

  it('deve retornar NotFoundError (404) ao tentar excluir produto inexistente', async () => {
    await expect(useCase.execute('produto-fantasma', sellerA)).rejects.toThrow(NotFoundError);
  });
});

