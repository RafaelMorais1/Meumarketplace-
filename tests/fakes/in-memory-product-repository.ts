import { IProductRepository, ListProductsFilters } from '@/modules/products/domain/product.repository';
import { Product, ProductWithSeller, PaginatedResult } from '@/modules/products/domain/product.entity';
import { InMemoryUserRepository } from './in-memory-user-repository';
import crypto from 'crypto';

export class InMemoryProductRepository implements IProductRepository {
  public products: Product[] = [];

  constructor(private userRepo?: InMemoryUserRepository) {}

  async findById(id: string): Promise<Product | null> {
    const product = this.products.find((p) => p.id === id);
    return product ? { ...product } : null;
  }

  async findByIdWithSeller(id: string): Promise<ProductWithSeller | null> {
    const product = await this.findById(id);
    if (!product) return null;

    const seller = this.userRepo ? await this.userRepo.findById(product.sellerId) : null;

    return {
      ...product,
      seller: {
        id: seller?.id || product.sellerId,
        name: seller?.name || 'Vendedor',
        email: seller?.email || 'seller@example.com',
      },
    };
  }

  async findBySellerId(sellerId: string): Promise<Product[]> {
    return this.products
      .filter((p) => p.sellerId === sellerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((p) => ({ ...p }));
  }

  async listPublic(filters: ListProductsFilters): Promise<PaginatedResult<ProductWithSeller>> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 10;
    const search = filters.search?.toLowerCase().trim();

    let filtered = [...this.products];

    if (search) {
      filtered = filtered.filter(
        (p) => p.title.toLowerCase().includes(search) || p.description.toLowerCase().includes(search)
      );
    }

    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const offset = (page - 1) * pageSize;
    const paginatedItems = filtered.slice(offset, offset + pageSize);

    const itemsWithSeller: ProductWithSeller[] = await Promise.all(
      paginatedItems.map(async (p) => {
        const seller = this.userRepo ? await this.userRepo.findById(p.sellerId) : null;
        return {
          ...p,
          seller: {
            id: seller?.id || p.sellerId,
            name: seller?.name || 'Vendedor',
            email: seller?.email || 'seller@example.com',
          },
        };
      })
    );

    return {
      items: itemsWithSeller,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Product> {
    const now = new Date();
    const product: Product = {
      id: data.id || crypto.randomUUID(),
      sellerId: data.sellerId,
      title: data.title,
      description: data.description,
      priceInCents: data.priceInCents,
      stock: data.stock,
      imageUrl: data.imageUrl ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.products.push(product);
    return { ...product };
  }

  async update(id: string, data: Partial<Omit<Product, 'id' | 'sellerId' | 'createdAt' | 'updatedAt'>>): Promise<Product> {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Produto não encontrado com id: ${id}`);
    }

    const current = this.products[index];
    const updated: Product = {
      ...current,
      ...data,
      updatedAt: new Date(),
    };

    this.products[index] = updated;
    return { ...updated };
  }

  async delete(id: string): Promise<void> {
    this.products = this.products.filter((p) => p.id !== id);
  }
}

