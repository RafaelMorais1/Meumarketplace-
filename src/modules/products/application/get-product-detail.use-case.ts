import { IProductRepository } from '../domain/product.repository';
import { ProductWithSeller } from '../domain/product.entity';
import { NotFoundError } from '@/shared/errors/app-error';

/**
 * Caso de Uso: Obtenção de Detalhes do Produto (RF-10)
 * Retorna as informações completas do produto, incluindo dados de contato/nome do vendedor.
 */
export class GetProductDetailUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(productId: string): Promise<ProductWithSeller> {
    if (!productId || typeof productId !== 'string') {
      throw new NotFoundError('Identificador de produto inválido.');
    }

    const productWithSeller = await this.productRepository.findByIdWithSeller(productId);
    if (!productWithSeller) {
      throw new NotFoundError('O produto solicitado não foi encontrado ou não está mais disponível.');
    }

    return productWithSeller;
  }
}

