import { IUserRepository } from '@/modules/users/domain/user.repository';
import { IPasswordResetTokenRepository } from '../domain/password-reset-token.repository';
import { IEmailService } from '../domain/email-service.interface';
import { PasswordResetTokenService } from '../infrastructure/password-reset-token.service';
import { forgotPasswordSchema, ForgotPasswordInput } from './auth.schemas';

export interface RequestPasswordResetOutput {
  success: boolean;
  message: string;
}

/**
 * Caso de Uso: Solicitação de Recuperação de Senha (RF-11, ADR-005, RN-07)
 * Implementa defesa anti-enumeração e gera tokens criptográficos SHA-256 em repouso.
 */
export class RequestPasswordResetUseCase {
  constructor(
    private userRepository: IUserRepository,
    private tokenRepository: IPasswordResetTokenRepository,
    private emailService: IEmailService
  ) {}

  async execute(input: ForgotPasswordInput & { baseUrl?: string }): Promise<RequestPasswordResetOutput> {
    const validated = forgotPasswordSchema.parse(input);
    const email = validated.email.toLowerCase();

    const genericSuccessMessage =
      'Se o e-mail informado estiver cadastrado em nossa plataforma, você receberá um link com as instruções para redefinir sua senha.';

    const user = await this.userRepository.findByEmail(email);

    // Defesa Anti-Enumeração (OWASP ASVS):
    // Se o usuário não existir, não revelamos erro. Retornamos a mesma mensagem de sucesso.
    if (!user) {
      return {
        success: true,
        message: genericSuccessMessage,
      };
    }

    // Invalida tokens anteriores não utilizados do mesmo usuário (RN-07)
    await this.tokenRepository.invalidateAllByUserId(user.id);

    // Gera token de alta entropia (256 bits)
    const rawToken = PasswordResetTokenService.generateToken();
    const tokenHash = PasswordResetTokenService.hashToken(rawToken);

    // Expiração estrita de 30 minutos (RN-07)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await this.tokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const host = input.baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetLink = `${host}/reset-password?token=${rawToken}`;

    await this.emailService.sendPasswordResetEmail(user.email, resetLink);

    return {
      success: true,
      message: genericSuccessMessage,
    };
  }
}
