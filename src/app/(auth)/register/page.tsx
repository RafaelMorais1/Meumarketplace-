'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { registerAction } from '@/modules/auth/presentation/auth.actions';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Criando conta...' : 'Cadastrar'}
    </button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useFormState(registerAction, null);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">
            Crie sua conta no Marketplace
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Já tem uma conta?{' '}
            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500">
              Faça login
            </Link>
          </p>
        </div>

        {state?.error && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-200 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <form action={formAction} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="name">
              Nome Completo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Ex: João Silva"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="seu@email.com"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
              Senha (mínimo 8 caracteres, com letras e números)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Qual é o seu objetivo principal?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="relative flex cursor-pointer rounded-lg border border-slate-300 p-3 shadow-sm focus:outline-none has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50/50">
                <input
                  type="radio"
                  name="role"
                  value="buyer"
                  defaultChecked
                  className="sr-only"
                />
                <span className="flex flex-col">
                  <span className="block text-sm font-semibold text-slate-900">Quero Comprar</span>
                  <span className="block text-xs text-slate-500">Explorar e adquirir produtos</span>
                </span>
              </label>

              <label className="relative flex cursor-pointer rounded-lg border border-slate-300 p-3 shadow-sm focus:outline-none has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50/50">
                <input
                  type="radio"
                  name="role"
                  value="seller"
                  className="sr-only"
                />
                <span className="flex flex-col">
                  <span className="block text-sm font-semibold text-slate-900">Quero Vender</span>
                  <span className="block text-xs text-slate-500">Cadastrar e gerenciar meus anúncios</span>
                </span>
              </label>
            </div>
          </div>

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}

