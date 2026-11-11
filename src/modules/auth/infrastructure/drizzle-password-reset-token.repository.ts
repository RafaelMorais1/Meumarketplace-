import { eq, and, isNull } from 'drizzle-orm';
import { db } from '@/infra/db/client';
import { passwordResetTokens } from '@/infra/db/schema';
import { IPasswordResetTokenRepository } from '../domain/password-reset-token.repository';
import { PasswordResetToken } from '../domain/password-reset-token.entity';

/**
 * Implementação Real do Repositório de Tokens de Recuperação via Drizzle ORM
 */
export class DrizzlePasswordResetTokenRepository implements IPasswordResetTokenRepository {
  constructor(private drizzleDb = db) {}

  async create(data: Omit<PasswordResetToken, 'id' | 'createdAt' | 'usedAt'> & { id?: string }): Promise<PasswordResetToken> {
    const [inserted] = await this.drizzleDb
      .insert(passwordResetTokens)
      .values({
        id: data.id,
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
      })
      .returning();

    return {
      id: inserted.id,
      userId: inserted.userId,
      tokenHash: inserted.tokenHash,
      expiresAt: inserted.expiresAt,
      usedAt: inserted.usedAt,
      createdAt: inserted.createdAt,
    };
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    const result = await this.drizzleDb
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.tokenHash, tokenHash))
      .limit(1);

    if (result.length === 0) return null;
    const row = result[0];

    return {
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash,
      expiresAt: row.expiresAt,
      usedAt: row.usedAt,
      createdAt: row.createdAt,
    };
  }

  async markAsUsed(id: string): Promise<void> {
    await this.drizzleDb
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, id));
  }

  async invalidateAllByUserId(userId: string): Promise<void> {
    await this.drizzleDb
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(passwordResetTokens.userId, userId),
          isNull(passwordResetTokens.usedAt)
        )
      );
  }
}
