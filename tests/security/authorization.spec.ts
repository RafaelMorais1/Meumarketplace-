import { describe, it, expect, beforeEach, vi } from 'vitest';
import { requireAuth, requireRole } from '@/modules/auth/presentation/auth.guard';
import * as authActions from '@/modules/auth/presentation/auth.actions';
import { ForbiddenError } from '@/shared/errors/app-error';

describe('Segurança e Autorização: Guards e Controle de Acesso Baseado em Papéis (RBAC)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('deve redirecionar/bloquear quando a requisição não possui usuário autenticado', async () => {
    // Simula visitante anônimo (sem cookie ou cookie inválido)
    vi.spyOn(authActions, 'getCurrentUser').mockResolvedValue(null);

    // No Next.js, redirect() lança uma exceção de controle de fluxo com código NEXT_REDIRECT
    await expect(requireAuth()).rejects.toThrow();
  });

  it('deve permitir acesso quando o usuário está autenticado e possui o papel exigido', async () => {
    vi.spyOn(authActions, 'getCurrentUser').mockResolvedValue({
      id: 'seller-1',
      name: 'Vendedor Autorizado',
      email: 'seller@loja.com',
      role: 'seller',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user = await requireRole('seller');
    expect(user.id).toBe('seller-1');
    expect(user.role).toBe('seller');
  });

  it('deve BLOQUEAR com ForbiddenError (403) se um comprador (buyer) tentar acessar rota de vendedor (RN-02)', async () => {
    // Por que esse teste importa? Garante que compradores não conseguem burlar a UI chamando ações restritas
    vi.spyOn(authActions, 'getCurrentUser').mockResolvedValue({
      id: 'buyer-1',
      name: 'Comprador Curioso',
      email: 'buyer@email.com',
      role: 'buyer',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(requireRole('seller')).rejects.toThrow(ForbiddenError);
    await expect(requireRole('seller')).rejects.toThrow(/não possui permissão para esta operação/);
  });
});

