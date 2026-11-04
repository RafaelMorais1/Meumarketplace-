import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">
          Marketplace MVP
        </h1>
        <p className="text-slate-600 mb-6">
          Plataforma de compra e venda construída como um monólito modular, com autenticação segura e controle rigoroso de acesso por papel (<code className="bg-slate-100 px-1 py-0.5 rounded text-sm">buyer</code> e <code className="bg-slate-100 px-1 py-0.5 rounded text-sm">seller</code>).
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Criar Conta
          </Link>
        </div>
      </div>
    </main>
  );
}

