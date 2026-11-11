'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-slate-900 font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
            Ocorreu um erro inesperado
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            {error.message || 'Houve uma instabilidade temporária ao carregar a página.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              Tentar novamente
            </button>
            <a
              href="/"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Página Inicial
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}

