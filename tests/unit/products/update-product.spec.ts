import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateProductUseCase } from '@/modules/products/application/update-product.use-case';
import { InMemoryProductRepository } from '@tests/fakes/in-memory-product-repository';
import { ForbiddenError, NotFoundError } from '@/shared/errors/app-error';

describe('RF-06: Edição de Produto (UpdateProductUseCase)', () => {
  let productRepo: InMemoryProductRepository;
  let useCase: UpdateProductUseCase;

  const sellerA = { id: 'seller-a', role: 'seller' };
  const sellerB = { id: 'seller-b', role: 'seller' };
  const buyer = { id: 'buyer-user', role: 'buyer' };

  let existingProduct: any;

  beforeEach(async () => {
    productRepo = new InMemoryProductRepository();
    useCase = new UpdateProductUseCase(productRepo);

    // Cria produto pertencente ao Vendedor A
    existingProduct = await productRepo.create({
      sellerId: sellerA.id,
      title: 'Mouse Sem Fio Original',
      description: 'Mouse ergonômico bluetooth',
      priceInCents: 15000, // R$ 150,00
      stock: 20,
    });
  });

  it('deve permitir que o vendedor dono edite os dados do seu produto com sucesso', async () => {
    // Valida o caminho feliz de alteração de preço e estoque pelo proprietário
    const updated = await useCase.execute(
      existingProduct.id,
      {
        title: 'Mouse Sem Fio Gamer PRO',
        priceInCents: 18000, // R$ 180,00
        stock: 15,
      },
      sellerA
    );

    expect(updated.title).toBe('Mouse Sem Fio Gamer PRO');
    expect(updated.priceInCents).toBe(18000);
    expect(updated.stock).toBe(15);
  });

  it('deve BLOQUEAR com ForbiddenError (403) se o Vendedor B tentar editar produto do Vendedor A (RN-03)', async () => {
    // Por que esse teste importa? Garante isolamento estrito: um vendedor NUNCA pode alterar produtos alheios
    await expect(
      useCase.execute(
        existingProduct.id,
        {
          priceInCents: 100, // Tentando sabotar o preço do concorrente para R$ 1,00
        },
        sellerB
      )
    ).rejects.toThrow(ForbiddenError);

    // O preço original no repositório permanece intacto
    const productInDb = await productRepo.findById(existingProduct.id);
    expect(productInDb?.priceInCents).toBe(15000);
  });

  it('deve BLOQUEAR com ForbiddenError (403) se um comprador tentar editar produto (RN-02)', async () => {
    await expect(
      useCase.execute(
        existingProduct.id,
        { title: 'Tentativa por Comprador' },
        buyer
      )
    ).rejects.toThrow(ForbiddenError);
  });

  it('deve retornar NotFoundError (404) se o produto não existir', async () => {
    await expect(
      useCase.execute(
        'id-inexistente',
        { title: 'Qualquer coisa' },
        sellerA
      )
    ).rejects.toThrow(NotFoundError);
  });
});

