import { eq, sql } from 'drizzle-orm';
import { db } from '@/infra/db/client';
import { users } from '@/infra/db/schema';
import { IUserRepository } from '../domain/user.repository';
import { User } from '../domain/user.entity';

/**
 * Implementação Real do Repositório de Usuários via Drizzle ORM
 */
export class DrizzleUserRepository implements IUserRepository {
  constructor(private drizzleDb = db) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.drizzleDb
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (result.length === 0) return null;
    const row = result[0];

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.passwordHash,
      role: row.role,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.drizzleDb
      .select()
      .from(users)
      .where(eq(sql`lower(${users.email})`, email.toLowerCase()))
      .limit(1);

    if (result.length === 0) return null;
    const row = result[0];

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.passwordHash,
      role: row.role,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<User> {
    const [inserted] = await this.drizzleDb
      .insert(users)
      .values({
        id: data.id,
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        role: data.role,
      })
      .returning();

    return {
      id: inserted.id,
      name: inserted.name,
      email: inserted.email,
      passwordHash: inserted.passwordHash,
      role: inserted.role,
      createdAt: inserted.createdAt,
      updatedAt: inserted.updatedAt,
    };
  }

  async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
    await this.drizzleDb
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }
}

