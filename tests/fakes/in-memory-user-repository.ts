import { IUserRepository } from '@/modules/users/domain/user.repository';
import { User } from '@/modules/users/domain/user.entity';
import crypto from 'crypto';

/**
 * Dublê de Testes (Fake In-Memory) para o Repositório de Usuários.
 * Permite que testes unitários executem em menos de 5ms sem precisar de banco de dados.
 */
export class InMemoryUserRepository implements IUserRepository {
  public users: User[] = [];

  async findById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.id === id);
    return user ? { ...user } : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user ? { ...user } : null;
  }

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<User> {
    const now = new Date();
    const newUser: User = {
      id: data.id || crypto.randomUUID(),
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      role: data.role,
      createdAt: now,
      updatedAt: now,
    };
    this.users.push(newUser);
    return { ...newUser };
  }
}

