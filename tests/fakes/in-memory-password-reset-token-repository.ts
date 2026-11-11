import { IPasswordResetTokenRepository } from '@/modules/auth/domain/password-reset-token.repository';
import { PasswordResetToken } from '@/modules/auth/domain/password-reset-token.entity';
import crypto from 'crypto';

export class InMemoryPasswordResetTokenRepository implements IPasswordResetTokenRepository {
  public tokens: PasswordResetToken[] = [];

  async create(data: Omit<PasswordResetToken, 'id' | 'createdAt' | 'usedAt'> & { id?: string }): Promise<PasswordResetToken> {
    const newToken: PasswordResetToken = {
      id: data.id || crypto.randomUUID(),
      userId: data.userId,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
      usedAt: null,
      createdAt: new Date(),
    };
    this.tokens.push(newToken);
    return { ...newToken };
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    const token = this.tokens.find((t) => t.tokenHash === tokenHash);
    return token ? { ...token } : null;
  }

  async markAsUsed(id: string): Promise<void> {
    const token = this.tokens.find((t) => t.id === id);
    if (token) {
      token.usedAt = new Date();
    }
  }

  async invalidateAllByUserId(userId: string): Promise<void> {
    const now = new Date();
    this.tokens
      .filter((t) => t.userId === userId && !t.usedAt)
      .forEach((t) => {
        t.usedAt = now;
      });
  }
}
