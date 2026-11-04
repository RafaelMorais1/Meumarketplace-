import { User } from '@/modules/users/domain/user.entity';

/**
 * Entidade de Sessão de Autenticação (RF-02, RF-03, ADR-003)
 */
export interface Session {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface SessionWithUser extends Session {
  user: User;
}

