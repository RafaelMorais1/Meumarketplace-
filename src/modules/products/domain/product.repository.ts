import { Product, ProductWithSeller, PaginatedResult } from './product.entity';

export interface ListProductsFilters {
  search?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Interface do Repositório de Produtos (IProductRepository)
 */
export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findByIdWithSeller(id: string): Promise<ProductWithSeller | null>;
  findBySellerId(sellerId: string): Promise<Product[]>;
  listPublic(filters: ListProductsFilters): Promise<PaginatedResult<ProductWithSeller>>;
  create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Product>;
  update(id: string, product: Partial<Omit<Product, 'id' | 'sellerId' | 'createdAt' | 'updatedAt'>>): Promise<Product>;
  delete(id: string): Promise<void>;
}

