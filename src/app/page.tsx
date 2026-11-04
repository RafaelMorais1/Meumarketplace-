import Link from 'next/link';
import { DrizzleProductRepository } from '@/modules/products/infrastructure/drizzle-product.repository';
import { ListPublicProductsUseCase } from '@/modules/products/application/list-public-products.use-case';

interface HomePageProps {
  searchParams?: {
    search?: string;
    page?: string;
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const search = searchParams?.search || '';
  const page = parseInt(searchParams?.page || '1', 10) || 1;

  const productRepo = new DrizzleProductRepository();
  const listPublic = new ListPublicProductsUseCase(productRepo);
  const result = await listPublic.execute({ search, page, pageSize: 9 });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Barra de Pesquisa e Filtro */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <form method="GET" action="/" className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Buscar produtos por nome ou descrição..."
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              Buscar
            </button>
            {search && (
              <Link
                href="/"
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center"
              >
                Limpar
              </Link>
            )}
          </div>
        </form>

        {search && (
          <p className="mt-3 text-sm text-slate-500">
            Exibindo resultados para: <strong className="text-slate-800">"{search}"</strong> ({result.total}{' '}
            {result.total === 1 ? 'produto encontrado' : 'produtos encontrados'})
          </p>
        )}
      </div>

      {/* Grade de Produtos */}
      {result.items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-semibold text-slate-900">Nenhum produto encontrado</h3>
          <p className="mt-1 text-sm text-slate-500">
            {search
              ? 'Tente pesquisar com termos mais gerais ou verifique a ortografia.'
              : 'Nenhum produto foi anunciado no marketplace ainda.'}
          </p>
          {search && (
            <div className="mt-4">
              <Link href="/" className="text-sm font-semibold text-blue-600 hover:text-blue-500">
                Ver todos os produtos
              </Link>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.items.map((product) => {
              const formattedPrice = (product.priceInCents / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              });

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
                >
                  {/* Imagem ou Placeholder */}
                  <div className="h-48 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center">
                        <span className="text-3xl">📦</span>
                        <span className="text-xs mt-1">Sem imagem</span>
                      </div>
                    )}
                    <span className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
                      {product.stock > 0 ? `${product.stock} em estoque` : 'Esgotado'}
                    </span>
                  </div>

                  {/* Informações */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {product.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">{product.description}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block">Preço</span>
                        <span className="text-lg font-bold text-slate-900">{formattedPrice}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Vendedor</span>
                        <span className="text-xs font-medium text-slate-700 truncate max-w-[120px] block">
                          {product.seller.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Paginação */}
          {result.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href={`/?search=${encodeURIComponent(search)}&page=${result.page - 1}`}
                aria-disabled={result.page <= 1}
                className={`rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors ${
                  result.page <= 1 ? 'pointer-events-none opacity-40' : ''
                }`}
              >
                ← Anterior
              </Link>

              <span className="text-sm text-slate-600 font-medium">
                Página {result.page} de {result.totalPages}
              </span>

              <Link
                href={`/?search=${encodeURIComponent(search)}&page=${result.page + 1}`}
                aria-disabled={result.page >= result.totalPages}
                className={`rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors ${
                  result.page >= result.totalPages ? 'pointer-events-none opacity-40' : ''
                }`}
              >
                Próxima →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
