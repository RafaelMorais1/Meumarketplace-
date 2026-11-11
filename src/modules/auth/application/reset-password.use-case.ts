import { IUserRepository } from '@/modules/users/domain/user.repository';
import { ISessionRepository } from '../domain/session.repository';
import { IPasswordResetTokenRepository } from '../domain/password-reset-token.repository';
import { IPasswordHasher } from '../domain/password-hasher.interface';
import { PasswordResetTokenService } from '../infrastructure/password-reset-token.service';
import { resetPasswordSchema, ResetPasswordInput } from './auth.schemas';
import { BadRequestError } from '@/shared/errors/app-error';

export interface ResetPasswordOutput {
  success: boolean;
  message: string;
}

/**
 * Caso de Uso: Redefinição de Senha com Token Seguro (RF-12, ADR-005, RN-07, RN-08)
 * Valida hash do token, expiração e uso anterior, atualiza a senha com Argon2id
 * e revoga todas as sessões ativas do usuário.
 */
export class ResetPasswordUseCase {
  constructor(
    private userRepository: IUserRepository,
    private tokenRepository: IPasswordResetTokenRepository,
    private sessionRepository: ISessionRepository,
    private passwordHasher: IPasswordHasher
  ) {}

  async execute(input: ResetPasswordInput): Promise<ResetPasswordOutput> {
    const validated = resetPasswordSchema.parse(input);

    // Calcula o hash SHA-256 do token fornecido no link
    const tokenHash = PasswordResetTokenService.hashToken(validated.token);

    const tokenRecord = await this.tokenRepository.findByTokenHash(tokenHash);

    // Se o token não existir, já tiver sido usado ou tiver expirado (RN-07)
    if (!tokenRecord) {
      throw new BadRequestError('Link de recuperação inválido ou expirado. Por favor, solicite um novo link.');
    }

    if (tokenRecord.usedAt !== null) {
      throw new BadRequestError('Este link de recuperação já foi utilizado. Por favor, solicite um novo link.');
    }

    if (tokenRecord.expiresAt.getTime() < Date.now()) {
      throw new BadRequestError('Este link de recuperação expirou. Por favor, solicite um novo link.');
    }

    // Hash da nova senha com Argon2id (RNF-01)
    const newPasswordHash = await this.passwordHasher.hash(validated.password);

    // Atualiza a senha do usuário
    await this.userRepository.updatePassword(tokenRecord.userId, newPasswordHash);

    // Marca o token como consumido (RN-07)
    await this.tokenRepository.markAsUsed(tokenRecord.id);

    // Revoga IMEDIATAMENTE todas as sessões ativas do usuário em todos os navegadores (RN-08)
    await this.sessionRepository.deleteByUserId(tokenRecord.userId);

    return {
      success: true,
      message: 'Sua senha foi redefinida com sucesso! Você já pode realizar login com a nova senha.',
    };
  }
}

