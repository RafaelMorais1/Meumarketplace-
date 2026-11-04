import { notFound } from 'next/navigation';
import Link from 'next/link';
import { DrizzleProductRepository } from '@/modules/products/infrastructure/drizzle-product.repository';
import { GetProductDetailUseCase } from '@/modules/products/application/get-product-detail.use-case';
import { NotFoundError } from '@/shared/errors/app-error';

interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const productRepo = new DrizzleProductRepository();
  const getProductDetail = new GetProductDetailUseCase(productRepo);

  let product;
  try {
    product = await getProductDetail.execute(params.id);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  const formattedPrice = (product.priceInCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="mb-6">
        <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-500">
          ← Voltar para o Catálogo
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2">
        {/* Lado Esquerdo: Imagem */}
        <div className="h-96 md:h-full bg-slate-100 flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-slate-200">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="max-h-full max-w-full object-contain rounded-xl shadow-sm"
            />
          ) : (
            <div className="text-center text-slate-400">
              <span className="text-6xl">📦</span>
              <p className="mt-2 text-sm">Sem foto disponível</p>
            </div>
          )}
        </div>

        {/* Lado Direito: Detalhes e Compra */}
        <div className="p-8 md:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                Produto Verificado
              </span>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  product.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}
              >
                {product.stock > 0 ? `${product.stock} disponíveis em estoque` : 'Esgotado'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-4">
              {product.title}
            </h1>

            <div className="text-3xl font-extrabold text-slate-900 mb-6">
              {formattedPrice}
            </div>

            <div className="prose prose-sm text-slate-600 mb-8 whitespace-pre-line border-t border-b border-slate-100 py-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Descrição</h4>
              {product.description}
            </div>
          </div>

          <div>
            {/* Box de Informações do Vendedor */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                Anunciado por
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 text-sm">{product.seller.name}</span>
                  <span className="text-xs text-slate-500 block">{product.seller.email}</span>
                </div>
                <span className="text-xs bg-slate-200/80 text-slate-700 px-2.5 py-1 rounded-md font-medium">
                  Vendedor Oficial
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={product.stock === 0}
              className="w-full rounded-xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {product.stock > 0 ? 'Comprar Agora (Simulação)' : 'Produto Esgotado'}
            </button>
            <p className="text-xs text-center text-slate-400 mt-2">
              * Pagamentos e carrinho serão habilitados na Fase 2 do Roadmap.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

