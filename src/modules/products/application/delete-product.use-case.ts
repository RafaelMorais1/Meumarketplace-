import { IProductRepository } from '../domain/product.repository';
import { ForbiddenError, NotFoundError } from '@/shared/errors/app-error';

interface CurrentSellerContext {
  id: string;
  role: string;
}

/**
 * Caso de Uso: Exclusão de Produto (RF-07)
 * Regras aplicadas:
 * - RN-02: Apenas vendedores
 * - RN-03: Bloqueio estrito se o produto pertencer a outro vendedor (403)
 */
export class DeleteProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(productId: string, seller: CurrentSellerContext): Promise<void> {
    if (seller.role !== 'seller') {
      throw new ForbiddenError('Apenas vendedores podem remover produtos.');
    }

    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError('Produto não encontrado.');
    }

    // RN-03: Apenas o proprietário pode deletar
    if (product.sellerId !== seller.id) {
      throw new ForbiddenError('Acesso negado: Você não pode excluir produtos cadastrados por outro vendedor.');
    }

    await this.productRepository.delete(productId);
  }
}

