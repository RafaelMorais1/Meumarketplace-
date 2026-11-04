import { ISessionRepository } from '../domain/session.repository';
import { SessionTokenService } from '../infrastructure/session-token.service';

/**
 * Caso de Uso: Encerramento de Sessão / Logout (RF-03)
 * Invalida imediatamente a sessão no banco de dados.
 */
export class LogoutUserUseCase {
  constructor(private sessionRepository: ISessionRepository) {}

  async execute(sessionToken: string): Promise<void> {
    if (!sessionToken) return;

    // Calcula o hash do token para localizar e remover o registro
    const tokenHash = SessionTokenService.hashToken(sessionToken);
    await this.sessionRepository.deleteByTokenHash(tokenHash);
  }
}

