import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireRole } from '@/modules/auth/presentation/auth.guard';
import { DrizzleProductRepository } from '@/modules/products/infrastructure/drizzle-product.repository';
import { EditProductForm } from './edit-form';

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const seller = await requireRole('seller');

  const productRepo = new DrizzleProductRepository();
  const product = await productRepo.findById(params.id);

  if (!product) {
    notFound();
  }

  // RN-03: Se o produto não pertencer a este vendedor, bloqueia
  if (product.sellerId !== seller.id) {
    throw new Error('Acesso negado: Você não tem permissão para editar este produto.');
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard/products" className="text-sm font-medium text-blue-600 hover:text-blue-500">
          ← Voltar para Meus Produtos
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">Editar Produto</h1>
        <p className="text-sm text-slate-500">Atualize os detalhes e o preço do seu anúncio.</p>
      </div>

      <EditProductForm product={product} />
    </div>
  );
}

