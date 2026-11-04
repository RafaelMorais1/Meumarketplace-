import Link from 'next/link';
import { getCurrentUser, logoutAction } from '@/modules/auth/presentation/auth.actions';

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold tracking-tight text-blue-600 hover:text-blue-700">
            Marketplace
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Catálogo
            </Link>
            {user?.role === 'seller' && (
              <Link href="/dashboard/products" className="text-blue-600 hover:text-blue-700 font-semibold">
                Meus Produtos (Vendedor)
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="block text-sm font-semibold text-slate-800">{user.name}</span>
                <span className="inline-block text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                  {user.role === 'seller' ? 'Vendedor' : 'Comprador'}
                </span>
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Sair
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
              >
                Cadastre-se
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

