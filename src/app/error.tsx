'use client';

import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isForbidden = error.message.includes('Acesso negado') || error.message.includes('403');

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="text-4xl mb-3">{isForbidden ? '🚫' : '⚠️'}</div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
          {isForbidden ? 'Acesso Negado (403)' : 'Ocorreu um erro'}
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          {error.message || 'Não foi possível completar sua requisição.'}
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            Voltar para a Página Inicial
          </Link>
          {!isForbidden && (
            <button
              onClick={() => reset()}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Tentar Novamente
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

