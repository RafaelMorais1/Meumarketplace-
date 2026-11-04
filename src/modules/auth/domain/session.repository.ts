import { Session, SessionWithUser } from './session.entity';

/**
 * Interface do Repositório de Sessões
 */
export interface ISessionRepository {
  create(session: Omit<Session, 'id' | 'createdAt'> & { id?: string }): Promise<Session>;
  findByTokenHash(tokenHash: string): Promise<SessionWithUser | null>;
  deleteByTokenHash(tokenHash: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}

