import { IUserRepository } from '@/modules/users/domain/user.repository';
import { ISessionRepository } from '../domain/session.repository';
import { IPasswordHasher } from '../domain/password-hasher.interface';
import { SessionTokenService } from '../infrastructure/session-token.service';
import { LoginInput, loginSchema } from './auth.schemas';
import { UnauthorizedError } from '@/shared/errors/app-error';
import { PublicUser } from '@/modules/users/domain/user.entity';

export interface LoginResult {
  sessionToken: string;
  user: PublicUser;
}

/**
 * Caso de Uso: Autenticação de Usuário / Login (RF-02)
 * Regras aplicadas:
 * - Mensagens de erro genéricas para prevenir enumeração de contas
 * - RNF-02 / ADR-003: Emissão de token aleatório de alta entropia e persistência de SHA-256
 * - RN-06: Validade de 7 dias para a sessão
 * - RNF-03: Sanitização completa do perfil retornado
 */
export class LoginUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private sessionRepository: ISessionRepository,
    private passwordHasher: IPasswordHasher
  ) {}

  async execute(input: LoginInput): Promise<LoginResult> {
    const validatedData = loginSchema.parse(input);

    // 1. Busca pelo usuário pelo e-mail
    const user = await this.userRepository.findByEmail(validatedData.email);
    if (!user) {
      // Importante: Não dizemos "e-mail não encontrado" para não revelar se o e-mail existe no banco
      throw new UnauthorizedError('Credenciais inválidas. Verifique seu e-mail e senha.');
    }

    // 2. Compara a senha fornecida com o hash gravado
    const isPasswordValid = await this.passwordHasher.compare(validatedData.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciais inválidas. Verifique seu e-mail e senha.');
    }

    // 3. Emite um token de sessão seguro (256 bits)
    const sessionToken = SessionTokenService.generateToken();
    const tokenHash = SessionTokenService.hashToken(sessionToken);

    // 4. Define expiração da sessão para 7 dias a partir de agora (RN-06)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    // 5. Salva a sessão no repositório com o tokenHash
    await this.sessionRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    // 6. Retorna o token para envio via cookie HttpOnly e o usuário sanitizado
    const { passwordHash: _, ...publicUser } = user;

    return {
      sessionToken,
      user: publicUser,
    };
  }
}

