import { ISessionRepository } from '../domain/session.repository';
import { SessionTokenService } from '../infrastructure/session-token.service';
import { PublicUser } from '@/modules/users/domain/user.entity';

/**
 * Caso de Uso: Obter Usuário da Sessão Atual (RF-04)
 * Valida o token de sessão e retorna o perfil autenticado (RNF-03).
 */
export class GetCurrentUserUseCase {
  constructor(private sessionRepository: ISessionRepository) {}

  async execute(sessionToken?: string | null): Promise<PublicUser | null> {
    if (!sessionToken || typeof sessionToken !== 'string') {
      return null;
    }

    // Calcula o hash do token para busca no índice do banco
    const tokenHash = SessionTokenService.hashToken(sessionToken);
    const sessionWithUser = await this.sessionRepository.findByTokenHash(tokenHash);

    if (!sessionWithUser) {
      return null;
    }

    // Retorna o perfil higienizado sem o password_hash
    const { passwordHash: _, ...publicUser } = sessionWithUser.user;
    return publicUser;
  }
}

