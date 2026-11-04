import { IProductRepository } from '../domain/product.repository';
import { Product } from '../domain/product.entity';
import { ForbiddenError } from '@/shared/errors/app-error';

interface CurrentSellerContext {
  id: string;
  role: string;
}

/**
 * Caso de Uso: Listagem de Produtos do Vendedor (RF-08)
 * Retorna exclusivamente os anúncios pertencentes ao vendedor autenticado.
 */
export class ListSellerProductsUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(seller: CurrentSellerContext): Promise<Product[]> {
    if (seller.role !== 'seller') {
      throw new ForbiddenError('Apenas vendedores podem acessar a listagem de gestão de produtos.');
    }

    return this.productRepository.findBySellerId(seller.id);
  }
}

