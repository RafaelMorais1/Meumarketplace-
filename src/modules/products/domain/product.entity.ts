/**
 * Entidade de Produto (RF-05, RF-06, RF-07, RF-08, RF-09, RF-10)
 */
export interface Product {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  priceInCents: number; // RNF-06: Preço em centavos
  stock: number;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductWithSeller extends Product {
  seller: {
    id: string;
    name: string;
    email: string;
  };
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

