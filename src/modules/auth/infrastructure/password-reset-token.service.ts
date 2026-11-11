import crypto from 'crypto';

/**
 * Serviço Criptográfico para Tokens de Recuperação de Senha (ADR-005, OWASP)
 */
export class PasswordResetTokenService {
  /**
   * Gera um token de 32 bytes (256 bits) em hexadecimal (64 caracteres).
   * Este token trafega exclusivamente no link enviado por e-mail.
   */
  static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Calcula o hash SHA-256 unidirecional do token.
   * Apenas o hash é persistido no banco de dados.
   */
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
