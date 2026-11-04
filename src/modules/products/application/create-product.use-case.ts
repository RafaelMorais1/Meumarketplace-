import { IProductRepository } from '../domain/product.repository';
import { Product } from '../domain/product.entity';
import { CreateProductInput, createProductSchema } from './product.schemas';
import { ForbiddenError } from '@/shared/errors/app-error';

interface CurrentSellerContext {
  id: string;
  role: string;
}

/**
 * Caso de Uso: Criação de Produto (RF-05)
 * Regras aplicadas:
 * - RN-02: Apenas usuários com papel 'seller' podem criar produtos (compradores recebem 403)
 * - RN-05: Preço maior ou igual a 50 centavos (R$ 0,50)
 * - RNF-06: Preço armazenado como inteiro em centavos
 */
export class CreateProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(input: CreateProductInput, seller: CurrentSellerContext): Promise<Product> {
    // 1. RN-02: Autorização RBAC estrita
    if (seller.role !== 'seller') {
      throw new ForbiddenError('Apenas usuários com papel de vendedor (seller) podem anunciar produtos.');
    }

    // 2. Validação dos dados do produto com Zod
    const validatedData = createProductSchema.parse(input);

    // 3. Persistência do produto vinculado ao ID do vendedor
    return this.productRepository.create({
      sellerId: seller.id,
      title: validatedData.title,
      description: validatedData.description,
      priceInCents: validatedData.priceInCents,
      stock: validatedData.stock,
      imageUrl: validatedData.imageUrl,
    });
  }
}

