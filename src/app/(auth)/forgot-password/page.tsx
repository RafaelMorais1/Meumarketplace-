'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { forgotPasswordAction } from '@/modules/auth/presentation/auth.actions';
import { KeyRound, ArrowLeft, MailCheck } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Enviando...' : 'Enviar instruções'}
    </button>
  );
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState(forgotPasswordAction, null);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Recuperar senha
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Informe o e-mail da sua conta para enviarmos o link de redefinição de senha.
          </p>
        </div>

        {state?.error && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-200 text-sm text-red-700">
            {state.error}
          </div>
        )}

        {state?.success && state?.message && (
          <div className="rounded-lg bg-green-50 p-4 border border-green-200 text-sm text-green-800 space-y-3">
            <div className="flex items-start gap-2.5">
              <MailCheck className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">Solicitação enviada!</p>
                <p className="mt-1 text-green-800">{state.message}</p>
              </div>
            </div>
            <div className="rounded bg-white/70 p-2 text-xs text-slate-600 border border-green-100">
              💡 <strong>Dica de desenvolvimento:</strong> Em ambiente local, verifique o terminal do servidor Next.js para visualizar o link de redefinição gerado.
            </div>
          </div>
        )}

        {!state?.success && (
          <form action={formAction} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
                Seu e-mail cadastrado
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="exemplo@email.com"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
              />
            </div>

            <SubmitButton />
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100">
          <Link
            href="/login"
            className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
