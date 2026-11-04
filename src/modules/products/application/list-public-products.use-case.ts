import { IProductRepository, ListProductsFilters } from '../domain/product.repository';
import { ProductWithSeller, PaginatedResult } from '../domain/product.entity';

/**
 * Caso de Uso: Listagem Pública de Produtos (RF-09)
 * Permite que qualquer visitante consulte o catálogo com paginação e busca por nome/descrição.
 */
export class ListPublicProductsUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(filters: ListProductsFilters): Promise<PaginatedResult<ProductWithSeller>> {
    // Higieniza parâmetros de paginação para evitar valores negativos ou zero
    const page = filters.page && filters.page > 0 ? Math.floor(filters.page) : 1;
    const pageSize = filters.pageSize && filters.pageSize > 0 ? Math.min(Math.floor(filters.pageSize), 50) : 9;

    return this.productRepository.listPublic({
      search: filters.search?.trim(),
      page,
      pageSize,
    });
  }
}

