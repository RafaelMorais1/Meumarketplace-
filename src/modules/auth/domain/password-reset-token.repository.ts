import { PasswordResetToken } from './password-reset-token.entity';

/**
 * Interface do Repositório de Tokens de Recuperação de Senha (Porta de Domínio)
 */
export interface IPasswordResetTokenRepository {
  create(data: Omit<PasswordResetToken, 'id' | 'createdAt' | 'usedAt'> & { id?: string }): Promise<PasswordResetToken>;
  findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null>;
  markAsUsed(id: string): Promise<void>;
  invalidateAllByUserId(userId: string): Promise<void>;
}
