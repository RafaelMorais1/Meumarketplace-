export type UserRole = 'buyer' | 'seller';

/**
 * Entidade de Domínio User (RF-01, RF-02, RF-04)
 * Representa o usuário na camada de negócio, desacoplada do banco de dados.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Perfil público do usuário (RNF-03: sanitizado, sem passwordHash)
 */
export type PublicUser = Omit<User, 'passwordHash'>;

