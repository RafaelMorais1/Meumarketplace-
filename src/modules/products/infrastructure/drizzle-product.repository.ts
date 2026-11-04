import { eq, desc, ilike, or, sql, count } from 'drizzle-orm';
import { db } from '@/infra/db/client';
import { products, users } from '@/infra/db/schema';
import { IProductRepository, ListProductsFilters } from '../domain/product.repository';
import { Product, ProductWithSeller, PaginatedResult } from '../domain/product.entity';

/**
 * Repositório Real de Produtos via Drizzle ORM
 */
export class DrizzleProductRepository implements IProductRepository {
  constructor(private drizzleDb = db) {}

  async findById(id: string): Promise<Product | null> {
    const result = await this.drizzleDb
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (result.length === 0) return null;
    const row = result[0];

    return {
      id: row.id,
      sellerId: row.sellerId,
      title: row.title,
      description: row.description,
      priceInCents: row.priceInCents,
      stock: row.stock,
      imageUrl: row.imageUrl,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findByIdWithSeller(id: string): Promise<ProductWithSeller | null> {
    const result = await this.drizzleDb
      .select({
        product: products,
        seller: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(products)
      .innerJoin(users, eq(products.sellerId, users.id))
      .where(eq(products.id, id))
      .limit(1);

    if (result.length === 0) return null;
    const { product, seller } = result[0];

    return {
      id: product.id,
      sellerId: product.sellerId,
      title: product.title,
      description: product.description,
      priceInCents: product.priceInCents,
      stock: product.stock,
      imageUrl: product.imageUrl,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      seller,
    };
  }

  async findBySellerId(sellerId: string): Promise<Product[]> {
    const result = await this.drizzleDb
      .select()
      .from(products)
      .where(eq(products.sellerId, sellerId))
      .orderBy(desc(products.createdAt));

    return result.map((row) => ({
      id: row.id,
      sellerId: row.sellerId,
      title: row.title,
      description: row.description,
      priceInCents: row.priceInCents,
      stock: row.stock,
      imageUrl: row.imageUrl,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  async listPublic(filters: ListProductsFilters): Promise<PaginatedResult<ProductWithSeller>> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 10;
    const offset = (page - 1) * pageSize;

    const searchCondition = filters.search?.trim()
      ? or(
          ilike(products.title, `%${filters.search.trim()}%`),
          ilike(products.description, `%${filters.search.trim()}%`)
        )
      : undefined;

    // 1. Total de registros para cálculo de totalPages
    const [countResult] = await this.drizzleDb
      .select({ total: count() })
      .from(products)
      .where(searchCondition);

    const total = Number(countResult?.total || 0);
    const totalPages = Math.ceil(total / pageSize) || 1;

    // 2. Registros da página solicitada
    const rows = await this.drizzleDb
      .select({
        product: products,
        seller: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(products)
      .innerJoin(users, eq(products.sellerId, users.id))
      .where(searchCondition)
      .orderBy(desc(products.createdAt))
      .limit(pageSize)
      .offset(offset);

    const items: ProductWithSeller[] = rows.map(({ product, seller }) => ({
      id: product.id,
      sellerId: product.sellerId,
      title: product.title,
      description: product.description,
      priceInCents: product.priceInCents,
      stock: product.stock,
      imageUrl: product.imageUrl,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      seller,
    }));

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Product> {
    const [inserted] = await this.drizzleDb
      .insert(products)
      .values({
        id: data.id,
        sellerId: data.sellerId,
        title: data.title,
        description: data.description,
        priceInCents: data.priceInCents,
        stock: data.stock,
        imageUrl: data.imageUrl,
      })
      .returning();

    return {
      id: inserted.id,
      sellerId: inserted.sellerId,
      title: inserted.title,
      description: inserted.description,
      priceInCents: inserted.priceInCents,
      stock: inserted.stock,
      imageUrl: inserted.imageUrl,
      createdAt: inserted.createdAt,
      updatedAt: inserted.updatedAt,
    };
  }

  async update(id: string, data: Partial<Omit<Product, 'id' | 'sellerId' | 'createdAt' | 'updatedAt'>>): Promise<Product> {
    const [updated] = await this.drizzleDb
      .update(products)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    if (!updated) {
      throw new Error(`Produto não encontrado para atualização com id: ${id}`);
    }

    return {
      id: updated.id,
      sellerId: updated.sellerId,
      title: updated.title,
      description: updated.description,
      priceInCents: updated.priceInCents,
      stock: updated.stock,
      imageUrl: updated.imageUrl,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async delete(id: string): Promise<void> {
    await this.drizzleDb.delete(products).where(eq(products.id, id));
  }
}

