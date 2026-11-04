import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="text-4xl mb-3">🔍</div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Página Não Encontrada (404)</h2>
        <p className="text-sm text-slate-600 mb-6">
          O recurso ou produto que você está procurando não existe ou foi removido do catálogo.
        </p>
        <Link
          href="/"
          className="inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          Voltar para o Catálogo
        </Link>
      </div>
    </div>
  );
}

