/**
 * Entidade de Domínio: Token de Recuperação de Senha (RF-11, RF-12, ADR-005)
 */
export interface PasswordResetToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}
