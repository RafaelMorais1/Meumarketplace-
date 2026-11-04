import { IUserRepository } from '@/modules/users/domain/user.repository';
import { PublicUser } from '@/modules/users/domain/user.entity';
import { IPasswordHasher } from '../domain/password-hasher.interface';
import { RegisterInput, registerSchema } from './auth.schemas';
import { ConflictError } from '@/shared/errors/app-error';

/**
 * Caso de Uso: Cadastro de Novo Usuário (RF-01)
 * Regras aplicadas:
 * - RN-01: Papel obrigatório 'buyer' ou 'seller'
 * - RN-04: Senha mínima de 8 caracteres com letras e números
 * - RNF-01: Hashing com Argon2id
 * - RNF-03: Nunca retorna o hash de senha
 */
export class RegisterUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private passwordHasher: IPasswordHasher
  ) {}

  async execute(input: RegisterInput): Promise<PublicUser> {
    // 1. Validação dos dados com Zod (fail-fast)
    const validatedData = registerSchema.parse(input);

    // 2. Verifica se o e-mail já existe no sistema
    const existingUser = await this.userRepository.findByEmail(validatedData.email);
    if (existingUser) {
      throw new ConflictError('Este endereço de e-mail já está em uso.');
    }

    // 3. Hash da senha (KDF seguro)
    const passwordHash = await this.passwordHasher.hash(validatedData.password);

    // 4. Criação do usuário no repositório
    const user = await this.userRepository.create({
      name: validatedData.name,
      email: validatedData.email,
      passwordHash,
      role: validatedData.role,
    });

    // 5. Sanitização de saída (RNF-03): NUNCA expor o hash de senha
    const { passwordHash: _, ...publicUser } = user;
    return publicUser;
  }
}

