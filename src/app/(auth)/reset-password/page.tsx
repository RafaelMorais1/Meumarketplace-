'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { resetPasswordAction } from '@/modules/auth/presentation/auth.actions';
import { LockKeyhole, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Redefinindo...' : 'Salvar nova senha'}
    </button>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [state, formAction] = useFormState(resetPasswordAction, null);

  if (!token) {
    return (
      <div className="rounded-xl bg-amber-50 p-6 border border-amber-200 text-center space-y-4">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold text-amber-900">Link incompleto ou ausente</h3>
        <p className="text-sm text-amber-800">
          O link de redefinição não contém o token necessário. Por favor, utilize o link recebido por e-mail ou solicite um novo.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center text-sm font-semibold text-amber-900 underline hover:text-amber-700"
        >
          Solicitar novo link de recuperação
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {state?.error && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-200 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {state?.success ? (
        <div className="rounded-xl bg-green-50 p-6 border border-green-200 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-green-950">Senha alterada com sucesso!</h3>
          <p className="text-sm text-green-800">
            Sua conta agora está protegida com sua nova senha. Todas as sessões anteriores foram encerradas por segurança.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 gap-1.5 transition-colors"
            >
              Fazer login agora
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <form action={formAction} className="space-y-5">
          {/* Campo oculto com o token extraído da URL */}
          <input type="hidden" name="token" value={token} />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
              Nova senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="Mínimo 8 caracteres, com letra e número"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
            />
            <p className="mt-1 text-xs text-slate-500">Mínimo 8 caracteres, contendo letras e números (RN-04).</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="confirmPassword">
              Confirme a nova senha
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              placeholder="Digite a mesma senha novamente"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
            />
          </div>

          <SubmitButton />
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Defina sua nova senha
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Crie uma nova senha segura para voltar a acessar sua conta no marketplace.
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-6 text-sm text-slate-500">Carregando formulário...</div>}>
          <ResetPasswordForm />
        </Suspense>

        <div className="text-center pt-2 border-t border-slate-100">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Lembrou sua senha? Faça login
          </Link>
        </div>
      </div>
    </div>
  );
}

