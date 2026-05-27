// Infrastructure: Prisma Repository Implementation
// Adapts domain IUserRepository to actual database

import { User } from '@domain/entities/User';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { PrismaClient } from '@prisma/client';

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async save(user: User): Promise<User> {
    const dbUser = await this.prisma.user.create({
      data: {
        email: user.email,
        password: user.password,
        name: user.name,
        verified: user.verified,
      },
    });

    return new User(dbUser.id, dbUser.email, dbUser.password, dbUser.name, dbUser.verified, dbUser.createdAt);
  }

  async findById(id: string): Promise<User | null> {
    const dbUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!dbUser) return null;

    return new User(dbUser.id, dbUser.email, dbUser.password, dbUser.name, dbUser.verified, dbUser.createdAt);
  }

  async findByEmail(email: string): Promise<User | null> {
    const dbUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!dbUser) return null;

    return new User(dbUser.id, dbUser.email, dbUser.password, dbUser.name, dbUser.verified, dbUser.createdAt);
  }

  async update(user: User): Promise<User> {
    const dbUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        password: user.password,
        name: user.name,
        verified: user.verified,
      },
    });

    return new User(dbUser.id, dbUser.email, dbUser.password, dbUser.name, dbUser.verified, dbUser.createdAt);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
