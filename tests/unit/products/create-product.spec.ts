import { describe, it, expect, beforeEach } from 'vitest';
import { CreateProductUseCase } from '@/modules/products/application/create-product.use-case';
import { InMemoryProductRepository } from '@tests/fakes/in-memory-product-repository';
import { ForbiddenError } from '@/shared/errors/app-error';

describe('RF-05: Criação de Produto (CreateProductUseCase)', () => {
  let productRepo: InMemoryProductRepository;
  let useCase: CreateProductUseCase;

  const validSeller = { id: 'seller-uuid-1', role: 'seller' };
  const invalidBuyer = { id: 'buyer-uuid-1', role: 'buyer' };

  beforeEach(() => {
    productRepo = new InMemoryProductRepository();
    useCase = new CreateProductUseCase(productRepo);
  });

  it('deve permitir que um vendedor (seller) crie um produto com preço válido em centavos (RF-05, RNF-06)', async () => {
    // Por que esse teste importa? Valida o fluxo feliz do vendedor cadastrando produto com valores em centavos
    const product = await useCase.execute(
      {
        title: 'Notebook Gamer',
        description: 'Notebook de alto desempenho para jogos e programação',
        priceInCents: 450000, // R$ 4.500,00
        stock: 10,
        imageUrl: 'https://exemplo.com/notebook.jpg',
      },
      validSeller
    );

    expect(product.id).toBeDefined();
    expect(product.title).toBe('Notebook Gamer');
    expect(product.priceInCents).toBe(450000);
    expect(product.stock).toBe(10);
    expect(product.sellerId).toBe(validSeller.id);

    // Valida que foi persistido no repositório
    expect(productRepo.products.length).toBe(1);
  });

  it('deve BLOQUEAR com ForbiddenError (403) se um comprador (buyer) tentar criar produto (RN-02)', async () => {
    // Por que esse teste importa? Garante que a regra de autorização por papel é estritamente cumprida
    await expect(
      useCase.execute(
        {
          title: 'Produto Ilegal',
          description: 'Tentativa de venda por um comprador',
          priceInCents: 10000,
          stock: 1,
        },
        invalidBuyer
      )
    ).rejects.toThrow(ForbiddenError);

    // Nenhum produto deve ter sido salvo
    expect(productRepo.products.length).toBe(0);
  });

  it('deve rejeitar criação com preço menor que 50 centavos (RN-05)', async () => {
    // Previne produtos com valores zerados, negativos ou insignificantes que gerem prejuízo nas taxas
    await expect(
      useCase.execute(
        {
          title: 'Produto Muito Barato',
          description: 'Descrição válida',
          priceInCents: 40, // 40 centavos (mínimo é 50 centavos)
          stock: 1,
        },
        validSeller
      )
    ).rejects.toThrow(/Preço mínimo/);
  });

  it('deve rejeitar criação com título menor que 3 caracteres (RF-05)', async () => {
    // Garante clareza mínima nos anúncios do marketplace
    await expect(
      useCase.execute(
        {
          title: 'Ab',
          description: 'Descrição válida',
          priceInCents: 1000,
          stock: 1,
        },
        validSeller
      )
    ).rejects.toThrow(/mínimo 3 caracteres/);
  });

  it('deve rejeitar estoque negativo', async () => {
    // Garante consistência de inventário
    await expect(
      useCase.execute(
        {
          title: 'Produto Teste',
          description: 'Descrição válida',
          priceInCents: 1000,
          stock: -5,
        },
        validSeller
      )
    ).rejects.toThrow(/não pode ser negativo/);
  });
});

