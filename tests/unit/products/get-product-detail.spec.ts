import { describe, it, expect, beforeEach } from 'vitest';
import { GetProductDetailUseCase } from '@/modules/products/application/get-product-detail.use-case';
import { InMemoryProductRepository } from '@tests/fakes/in-memory-product-repository';
import { InMemoryUserRepository } from '@tests/fakes/in-memory-user-repository';
import { NotFoundError } from '@/shared/errors/app-error';

describe('RF-10: Detalhes do Produto (GetProductDetailUseCase)', () => {
  let productRepo: InMemoryProductRepository;
  let userRepo: InMemoryUserRepository;
  let useCase: GetProductDetailUseCase;

  let seller: any;
  let product: any;

  beforeEach(async () => {
    userRepo = new InMemoryUserRepository();
    productRepo = new InMemoryProductRepository(userRepo);
    useCase = new GetProductDetailUseCase(productRepo);

    seller = await userRepo.create({
      name: 'Vendedor Confiável',
      email: 'confiavel@vendas.com',
      passwordHash: 'hash',
      role: 'seller',
    });

    product = await productRepo.create({
      sellerId: seller.id,
      title: 'Cadeira Ergonômica Mesh',
      description: 'Cadeira com apoio lombar ajustável e braços 3D',
      priceInCents: 89900, // R$ 899,00
      stock: 3,
      imageUrl: 'https://exemplo.com/cadeira.jpg',
    });
  });

  it('deve retornar as informações completas do produto com os dados do vendedor (RF-10)', async () => {
    // Por que esse teste importa? Garante que a tela de detalhe exibe tanto o produto quanto o anunciante
    const detail = await useCase.execute(product.id);

    expect(detail.id).toBe(product.id);
    expect(detail.title).toBe('Cadeira Ergonômica Mesh');
    expect(detail.priceInCents).toBe(89900);
    expect(detail.stock).toBe(3);
    expect(detail.seller).toBeDefined();
    expect(detail.seller.name).toBe('Vendedor Confiável');
    expect(detail.seller.email).toBe('confiavel@vendas.com');
  });

  it('deve lançar NotFoundError (404) quando o ID do produto não existir', async () => {
    // Garante que links quebrados geram a resposta 404 esperada
    await expect(useCase.execute('id-inexistente')).rejects.toThrow(NotFoundError);
  });

  it('deve lançar NotFoundError se o ID for vazio ou nulo', async () => {
    await expect(useCase.execute('')).rejects.toThrow(NotFoundError);
  });
});

