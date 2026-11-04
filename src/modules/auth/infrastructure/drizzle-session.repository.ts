import { eq } from 'drizzle-orm';
import { db } from '@/infra/db/client';
import { sessions, users } from '@/infra/db/schema';
import { ISessionRepository } from '../domain/session.repository';
import { Session, SessionWithUser } from '../domain/session.entity';

/**
 * Implementação Real do Repositório de Sessões via Drizzle ORM
 */
export class DrizzleSessionRepository implements ISessionRepository {
  constructor(private drizzleDb = db) {}

  async create(data: Omit<Session, 'id' | 'createdAt'> & { id?: string }): Promise<Session> {
    const [inserted] = await this.drizzleDb
      .insert(sessions)
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
      createdAt: inserted.createdAt,
    };
  }

  async findByTokenHash(tokenHash: string): Promise<SessionWithUser | null> {
    const result = await this.drizzleDb
      .select({
        session: sessions,
        user: users,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.tokenHash, tokenHash))
      .limit(1);

    if (result.length === 0) return null;
    const { session, user } = result[0];

    // Checa expiração em memória
    if (session.expiresAt.getTime() < Date.now()) {
      return null;
    }

    return {
      id: session.id,
      userId: session.userId,
      tokenHash: session.tokenHash,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async deleteByTokenHash(tokenHash: string): Promise<void> {
    await this.drizzleDb.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.drizzleDb.delete(sessions).where(eq(sessions.userId, userId));
  }
}

