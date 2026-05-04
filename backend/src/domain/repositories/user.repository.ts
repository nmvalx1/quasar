import type { User } from '../entities/user.entity.js';

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  name?: string | null;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
}
