import { describe, it, expect, beforeEach } from 'vitest';
import { LogoutUserUseCase } from '@/modules/auth/application/logout-user.use-case';
import { InMemoryUserRepository } from '@tests/fakes/in-memory-user-repository';
import { InMemorySessionRepository } from '@tests/fakes/in-memory-session-repository';
import { SessionTokenService } from '@/modules/auth/infrastructure/session-token.service';

describe('RF-03: Encerramento de Sessão / Logout (LogoutUserUseCase)', () => {
  let userRepo: InMemoryUserRepository;
  let sessionRepo: InMemorySessionRepository;
  let useCase: LogoutUserUseCase;

  beforeEach(async () => {
    userRepo = new InMemoryUserRepository();
    sessionRepo = new InMemorySessionRepository(userRepo);
    useCase = new LogoutUserUseCase(sessionRepo);
  });

  it('deve remover a sessão do repositório invalidando o token no mesmo instante', async () => {
    // Por que esse teste importa? Garante que após o logout o token perde imediatamente a validade
    const token = 'token-de-sessao-ativo-123';
    const tokenHash = SessionTokenService.hashToken(token);

    await sessionRepo.create({
      userId: 'user-1',
      tokenHash,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    });

    expect(sessionRepo.sessions.length).toBe(1);

    // Executa logout
    await useCase.execute(token);

    // Valida que a sessão foi removida
    expect(sessionRepo.sessions.length).toBe(0);
    const sessionFound = await sessionRepo.findByTokenHash(tokenHash);
    expect(sessionFound).toBeNull();
  });

  it('não deve quebrar se o token for vazio ou nulo', async () => {
    // Caso de borda: usuário clica em logout sem ter sessão ativa
    await expect(useCase.execute('')).resolves.not.toThrow();
  });
});

