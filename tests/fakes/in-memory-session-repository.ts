import { ISessionRepository } from '@/modules/auth/domain/session.repository';
import { Session, SessionWithUser } from '@/modules/auth/domain/session.entity';
import { InMemoryUserRepository } from './in-memory-user-repository';
import crypto from 'crypto';

export class InMemorySessionRepository implements ISessionRepository {
  public sessions: Session[] = [];

  constructor(private userRepo: InMemoryUserRepository) {}

  async create(data: Omit<Session, 'id' | 'createdAt'> & { id?: string }): Promise<Session> {
    const session: Session = {
      id: data.id || crypto.randomUUID(),
      userId: data.userId,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
    };
    this.sessions.push(session);
    return { ...session };
  }

  async findByTokenHash(tokenHash: string): Promise<SessionWithUser | null> {
    const session = this.sessions.find((s) => s.tokenHash === tokenHash);
    if (!session) return null;

    // Checa expiração
    if (session.expiresAt.getTime() < Date.now()) {
      return null;
    }

    const user = await this.userRepo.findById(session.userId);
    if (!user) return null;

    return {
      ...session,
      user,
    };
  }

  async deleteByTokenHash(tokenHash: string): Promise<void> {
    this.sessions = this.sessions.filter((s) => s.tokenHash !== tokenHash);
  }

  async deleteByUserId(userId: string): Promise<void> {
    this.sessions = this.sessions.filter((s) => s.userId !== userId);
  }
}

