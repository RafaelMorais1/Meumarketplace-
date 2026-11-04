import { IProductRepository } from '../domain/product.repository';
import { Product } from '../domain/product.entity';
import { UpdateProductInput, updateProductSchema } from './product.schemas';
import { ForbiddenError, NotFoundError } from '@/shared/errors/app-error';

interface CurrentSellerContext {
  id: string;
  role: string;
}

/**
 * Caso de Uso: Edição de Produto (RF-06)
 * Regras aplicadas:
 * - RN-02: Apenas vendedores têm acesso
 * - RN-03: Isolamento estrito entre vendedores (vendedor A não pode editar produtos de B)
 */
export class UpdateProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(productId: string, input: UpdateProductInput, seller: CurrentSellerContext): Promise<Product> {
    // 1. RN-02: Checagem de papel de vendedor
    if (seller.role !== 'seller') {
      throw new ForbiddenError('Apenas vendedores podem editar produtos.');
    }

    // 2. Busca o produto existente
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError('Produto não encontrado.');
    }

    // 3. RN-03: Garantia de propriedade (Isolamento entre vendedores)
    if (product.sellerId !== seller.id) {
      throw new ForbiddenError('Acesso negado: Você não tem permissão para alterar produtos de outro vendedor.');
    }

    // 4. Validação dos dados parciais com Zod
    const validatedData = updateProductSchema.parse(input);

    // 5. Execução da atualização no repositório
    return this.productRepository.update(productId, validatedData);
  }
}

