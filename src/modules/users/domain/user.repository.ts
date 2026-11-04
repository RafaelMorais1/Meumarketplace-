import { User } from './user.entity';

/**
 * Interface do Repositório de Usuários (Porta de Saída do Domínio)
 * O caso de uso depende DESTA INTERFACE, nunca do Drizzle ou Postgres diretamente.
 */
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<User>;
}

