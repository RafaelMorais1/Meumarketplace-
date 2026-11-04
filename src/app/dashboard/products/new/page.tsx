'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { createProductAction } from '@/modules/products/presentation/product.actions';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Salvando...' : 'Publicar Anúncio'}
    </button>
  );
}

export default function NewProductPage() {
  const [state, formAction] = useFormState(createProductAction, null);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard/products" className="text-sm font-medium text-blue-600 hover:text-blue-500">
          ← Voltar para Meus Produtos
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">Cadastrar Novo Produto</h1>
        <p className="text-sm text-slate-500">Preencha as informações do produto que você deseja colocar à venda.</p>
      </div>

      {state?.error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <form action={formAction} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="title">
            Título do Produto
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="Ex: Teclado Mecânico RGB Switch Blue"
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="description">
            Descrição Detalhada
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            required
            placeholder="Descreva o estado, especificações técnicas e benefícios do produto..."
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="price">
              Preço de Venda (R$)
            </label>
            <input
              id="price"
              name="price"
              type="text"
              required
              placeholder="Ex: 149,90"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
            />
            <span className="text-xs text-slate-500 mt-1 block">Mínimo R$ 0,50 (armazenado em centavos)</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="stock">
              Quantidade em Estoque
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              defaultValue="1"
              required
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="imageUrl">
            URL da Imagem (Opcional no MVP)
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            placeholder="https://exemplo.com/foto-do-produto.jpg"
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Link
            href="/dashboard/products"
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </Link>
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}

