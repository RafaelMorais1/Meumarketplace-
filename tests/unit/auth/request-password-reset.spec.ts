import { describe, it, expect, beforeEach } from 'vitest';
import { RequestPasswordResetUseCase } from '@/modules/auth/application/request-password-reset.use-case';
import { InMemoryUserRepository } from '@tests/fakes/in-memory-user-repository';
import { InMemoryPasswordResetTokenRepository } from '@tests/fakes/in-memory-password-reset-token-repository';
import { FakeEmailService } from '@tests/fakes/fake-email-service';
import { PasswordResetTokenService } from '@/modules/auth/infrastructure/password-reset-token.service';

describe('RF-11: Solicitação de Recuperação de Senha (RequestPasswordResetUseCase)', () => {
  let userRepo: InMemoryUserRepository;
  let tokenRepo: InMemoryPasswordResetTokenRepository;
  let emailService: FakeEmailService;
  let useCase: RequestPasswordResetUseCase;

  beforeEach(async () => {
    userRepo = new InMemoryUserRepository();
    tokenRepo = new InMemoryPasswordResetTokenRepository();
    emailService = new FakeEmailService();
    useCase = new RequestPasswordResetUseCase(userRepo, tokenRepo, emailService);

    // Cria usuário existente
    await userRepo.create({
      name: 'Comprador Ativo',
      email: 'comprador@example.com',
      passwordHash: 'dummy_hash',
      role: 'buyer',
    });
  });

  it('deve gerar token seguro, persistir apenas o hash SHA-256 e disparar e-mail com link (RF-11, ADR-005)', async () => {
    const result = await useCase.execute({ email: 'comprador@example.com' });

    expect(result.success).toBe(true);
    expect(result.message).toContain('Se o e-mail informado estiver cadastrado');

    // Verifica se gerou registro na tabela de tokens
    expect(tokenRepo.tokens.length).toBe(1);
    const savedToken = tokenRepo.tokens[0];
    expect(savedToken.usedAt).toBeNull();
    expect(savedToken.expiresAt.getTime()).toBeGreaterThan(Date.now() + 29 * 60 * 1000); // 30 min

    // Verifica se disparou e-mail com link contendo o token puro
    expect(emailService.sentEmails.length).toBe(1);
    const sent = emailService.sentEmails[0];
    expect(sent.toEmail).toBe('comprador@example.com');
    expect(sent.resetLink).toContain('/reset-password?token=');

    // O hash salvo no banco DEVE corresponder ao SHA-256 do token no link
    const url = new URL(sent.resetLink);
    const rawTokenFromLink = url.searchParams.get('token')!;
    expect(rawTokenFromLink).toBeDefined();
    expect(PasswordResetTokenService.hashToken(rawTokenFromLink)).toBe(savedToken.tokenHash);
  });

  it('deve retornar mensagem genérica idêntica e NÃO enviar e-mail quando o e-mail não existir (Anti-Enumeração OWASP)', async () => {
    const result = await useCase.execute({ email: 'desconhecido@example.com' });

    // Mensagem amigável e neutra
    expect(result.success).toBe(true);
    expect(result.message).toContain('Se o e-mail informado estiver cadastrado');

    // NENHUM token criado e nenhum e-mail enviado
    expect(tokenRepo.tokens.length).toBe(0);
    expect(emailService.sentEmails.length).toBe(0);
  });

  it('deve invalidar tokens anteriores não utilizados quando uma nova solicitação for feita (RN-07)', async () => {
    // 1ª solicitação
    await useCase.execute({ email: 'comprador@example.com' });
    expect(tokenRepo.tokens.length).toBe(1);
    expect(tokenRepo.tokens[0].usedAt).toBeNull();

    // 2ª solicitação antes de usar o primeiro token
    await useCase.execute({ email: 'comprador@example.com' });
    expect(tokenRepo.tokens.length).toBe(2);

    // O primeiro token deve ter sido invalidado (marcado com usedAt)
    expect(tokenRepo.tokens[0].usedAt).not.toBeNull();
    // O segundo token é o ativo
    expect(tokenRepo.tokens[1].usedAt).toBeNull();
  });
});

