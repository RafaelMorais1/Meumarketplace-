import Link from 'next/link';
import { requireRole } from '@/modules/auth/presentation/auth.guard';
import { DrizzleProductRepository } from '@/modules/products/infrastructure/drizzle-product.repository';
import { ListSellerProductsUseCase } from '@/modules/products/application/list-seller-products.use-case';
import { deleteProductAction } from '@/modules/products/presentation/product.actions';

export default async function SellerProductsPage() {
  const seller = await requireRole('seller');

  const productRepo = new DrizzleProductRepository();
  const listSellerProducts = new ListSellerProductsUseCase(productRepo);
  const products = await listSellerProducts.execute(seller);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Meus Produtos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gerencie os produtos que você anunciou no marketplace.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
          >
            + Cadastrar Novo Produto
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <h3 className="text-base font-semibold text-slate-900">Você ainda não possui produtos anunciados</h3>
          <p className="mt-1 text-sm text-slate-500">Comece a vender cadastrando seu primeiro produto agora mesmo.</p>
          <div className="mt-6">
            <Link
              href="/dashboard/products/new"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              Anunciar Primeiro Produto
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Preço</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Estoque</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {products.map((product) => {
                const formattedPrice = (product.priceInCents / 100).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                });

                return (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{product.title}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{product.description}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{formattedPrice}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{product.stock} un.</td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                      <Link
                        href={`/dashboard/products/${product.id}/edit`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Editar
                      </Link>
                      <form
                        action={deleteProductAction.bind(null, product.id)}
                        className="inline"
                      >
                        <button
                          type="submit"
                          className="text-red-600 hover:text-red-800"
                        >
                          Excluir
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

