import { redirect } from 'next/navigation';
import { getCurrentUser } from './auth.actions';
import { UserRole, PublicUser } from '@/modules/users/domain/user.entity';
import { ForbiddenError, UnauthorizedError } from '@/shared/errors/app-error';

/**
 * Guard de Autenticação Obrigatória
 * Garante que a requisição venha de um usuário autenticado.
 */
export async function requireAuth(): Promise<PublicUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}

/**
 * Guard de Controle de Acesso Baseado em Papel (RBAC - RN-02)
 * Garante que apenas o papel especificado (ex: 'seller') execute a ação.
 * Se for um comprador tentando acessar área de vendedor, bloqueia com 403 Forbidden.
 */
export async function requireRole(allowedRole: UserRole): Promise<PublicUser> {
  const user = await requireAuth();

  if (user.role !== allowedRole) {
    throw new ForbiddenError(
      `Acesso negado: Seu papel atual (${user.role}) não possui permissão para esta operação. Apenas '${allowedRole}' pode prosseguir.`
    );
  }

  return user;
}

