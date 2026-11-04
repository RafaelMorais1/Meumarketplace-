'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/modules/auth/presentation/auth.guard';
import { DrizzleProductRepository } from '../infrastructure/drizzle-product.repository';
import { CreateProductUseCase } from '../application/create-product.use-case';
import { UpdateProductUseCase } from '../application/update-product.use-case';
import { DeleteProductUseCase } from '../application/delete-product.use-case';
import { ListSellerProductsUseCase } from '../application/list-seller-products.use-case';
import { AppError } from '@/shared/errors/app-error';

function getProductUseCases() {
  const productRepo = new DrizzleProductRepository();

  return {
    createProduct: new CreateProductUseCase(productRepo),
    updateProduct: new UpdateProductUseCase(productRepo),
    deleteProduct: new DeleteProductUseCase(productRepo),
    listSellerProducts: new ListSellerProductsUseCase(productRepo),
    productRepo,
  };
}

export type ProductActionState = {
  error?: string;
  success?: boolean;
};

/**
 * Server Action: Criação de Produto (RF-05)
 * Apenas vendedores ('seller') podem invocar
 */
export async function createProductAction(
  prevState: ProductActionState | null,
  formData: FormData
): Promise<ProductActionState> {
  // Guard de autorização estrita: bloqueia com 403 se não for seller
  const seller = await requireRole('seller');
  const { createProduct } = getProductUseCases();

  // Converte reais digitados (ex: "49.90") em centavos inteiros (4990)
  const priceInput = formData.get('price') as string;
  const priceInCents = Math.round(parseFloat(priceInput.replace(',', '.')) * 100);

  const rawData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    priceInCents,
    stock: parseInt(formData.get('stock') as string, 10) || 0,
    imageUrl: (formData.get('imageUrl') as string) || undefined,
  };

  try {
    await createProduct.execute(rawData, seller);
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message };
    }
    if (error instanceof Error && error.name === 'ZodError') {
      return { error: (error as any).errors[0]?.message || 'Dados inválidos fornecidos.' };
    }
    return { error: 'Ocorreu um erro ao cadastrar o produto.' };
  }

  revalidatePath('/');
  revalidatePath('/dashboard/products');
  redirect('/dashboard/products');
}

/**
 * Server Action: Edição de Produto (RF-06)
 */
export async function updateProductAction(
  productId: string,
  prevState: ProductActionState | null,
  formData: FormData
): Promise<ProductActionState> {
  const seller = await requireRole('seller');
  const { updateProduct } = getProductUseCases();

  const priceInput = formData.get('price') as string;
  const priceInCents = priceInput ? Math.round(parseFloat(priceInput.replace(',', '.')) * 100) : undefined;

  const rawData = {
    title: (formData.get('title') as string) || undefined,
    description: (formData.get('description') as string) || undefined,
    priceInCents,
    stock: formData.has('stock') ? parseInt(formData.get('stock') as string, 10) : undefined,
    imageUrl: (formData.get('imageUrl') as string) || undefined,
  };

  try {
    await updateProduct.execute(productId, rawData, seller);
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message };
    }
    if (error instanceof Error && error.name === 'ZodError') {
      return { error: (error as any).errors[0]?.message || 'Dados inválidos fornecidos.' };
    }
    return { error: 'Ocorreu um erro ao atualizar o produto.' };
  }

  revalidatePath('/');
  revalidatePath('/dashboard/products');
  redirect('/dashboard/products');
}

/**
 * Server Action: Exclusão de Produto (RF-07)
 */
export async function deleteProductAction(productId: string): Promise<void> {
  const seller = await requireRole('seller');
  const { deleteProduct } = getProductUseCases();

  await deleteProduct.execute(productId, seller);

  revalidatePath('/');
  revalidatePath('/dashboard/products');
}

