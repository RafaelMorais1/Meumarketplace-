import { describe, it, expect, beforeEach } from 'vitest';
import { ResetPasswordUseCase } from '@/modules/auth/application/reset-password.use-case';
import { InMemoryUserRepository } from '@tests/fakes/in-memory-user-repository';
import { InMemorySessionRepository } from '@tests/fakes/in-memory-session-repository';
import { InMemoryPasswordResetTokenRepository } from '@tests/fakes/in-memory-password-reset-token-repository';
import { FakePasswordHasher } from '@tests/fakes/fake-password-hasher';
import { PasswordResetTokenService } from '@/modules/auth/infrastructure/password-reset-token.service';
import { BadRequestError } from '@/shared/errors/app-error';

describe('RF-12: Redefinição de Senha com Token (ResetPasswordUseCase)', () => {
  let userRepo: InMemoryUserRepository;
  let sessionRepo: InMemorySessionRepository;
  let tokenRepo: InMemoryPasswordResetTokenRepository;
  let hasher: FakePasswordHasher;
  let useCase: ResetPasswordUseCase;

  const rawToken = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
  const tokenHash = PasswordResetTokenService.hashToken(rawToken);
  let userId: string;

  beforeEach(async () => {
    userRepo = new InMemoryUserRepository();
    sessionRepo = new InMemorySessionRepository(userRepo);
    tokenRepo = new InMemoryPasswordResetTokenRepository();
    hasher = new FakePasswordHasher();
    useCase = new ResetPasswordUseCase(userRepo, tokenRepo, sessionRepo, hasher);

    // Cria usuário
    const user = await userRepo.create({
      name: 'Vendedor Exemplo',
      email: 'seller@example.com',
      passwordHash: await hasher.hash('Antiga123'),
      role: 'seller',
    });
    userId = user.id;

    // Cria sessão ativa para este usuário
    await sessionRepo.create({
      userId,
      tokenHash: 'sess_hash_1',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });

    // Cria token válido
    await tokenRepo.create({
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min
    });
  });

  it('deve redefinir senha com sucesso, marcar token como consumido e revogar sessões ativas (RF-12, RN-07, RN-08)', async () => {
    expect(sessionRepo.sessions.length).toBe(1);

    const result = await useCase.execute({
      token: rawToken,
      password: 'NovaSenhaForte123',
      confirmPassword: 'NovaSenhaForte123',
    });

    expect(result.success).toBe(true);

    // Senha do usuário foi atualizada
    const updatedUser = await userRepo.findById(userId);
    expect(await hasher.compare('NovaSenhaForte123', updatedUser!.passwordHash)).toBe(true);

    // Token foi marcado como consumido (usedAt)
    const tokenInRepo = await tokenRepo.findByTokenHash(tokenHash);
    expect(tokenInRepo!.usedAt).not.toBeNull();

    // TODAS as sessões anteriores do usuário foram destruídas (RN-08)
    expect(sessionRepo.sessions.length).toBe(0);
  });

  it('deve rejeitar token inexistente ou corrompido', async () => {
    await expect(
      useCase.execute({
        token: 'token_falso_que_nao_existe_no_banco',
        password: 'NovaSenhaForte123',
        confirmPassword: 'NovaSenhaForte123',
      })
    ).rejects.toThrow(BadRequestError);
  });

  it('deve rejeitar se o token já foi consumido anteriormente (RN-07)', async () => {
    // Consome o token pela primeira vez
    await useCase.execute({
      token: rawToken,
      password: 'NovaSenhaForte123',
      confirmPassword: 'NovaSenhaForte123',
    });

    // Tenta usar o mesmo token uma segunda vez (Replay Attack)
    await expect(
      useCase.execute({
        token: rawToken,
        password: 'OutraTentativa123',
        confirmPassword: 'OutraTentativa123',
      })
    ).rejects.toThrow('Este link de recuperação já foi utilizado');
  });

  it('deve rejeitar se o token estiver expirado (RN-07)', async () => {
    const expiredRawToken = 'expired1234567890expired1234567890expired1234567890expired1234567890';
    const expiredHash = PasswordResetTokenService.hashToken(expiredRawToken);

    await tokenRepo.create({
      userId,
      tokenHash: expiredHash,
      expiresAt: new Date(Date.now() - 1000), // Expirado há 1 segundo
    });

    await expect(
      useCase.execute({
        token: expiredRawToken,
        password: 'NovaSenhaForte123',
        confirmPassword: 'NovaSenhaForte123',
      })
    ).rejects.toThrow('Este link de recuperação expirou');
  });

  it('deve validar regras de complexidade da nova senha (mínimo 8 caracteres, letra e número - RN-04)', async () => {
    await expect(
      useCase.execute({
        token: rawToken,
        password: 'fraca',
        confirmPassword: 'fraca',
      })
    ).rejects.toThrow();
  });
});
