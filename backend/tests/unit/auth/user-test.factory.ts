import type { User } from '../../../src/domain/entities/user.entity.js';

let userIdCounter = 0;

export function makeUser(overrides: Partial<User> = {}): User {
  userIdCounter += 1;
  return {
    id: overrides.id ?? `user-${userIdCounter}`,
    email: overrides.email ?? `user-${userIdCounter}@quasar.test`,
    name: overrides.name ?? null,
    plan: overrides.plan ?? 'free',
    passwordHash:
      overrides.passwordHash === undefined ? 'hashed:initial' : overrides.passwordHash,
    createdAt: overrides.createdAt ?? new Date('2026-01-01T00:00:00Z'),
    updatedAt: overrides.updatedAt ?? new Date('2026-01-01T00:00:00Z'),
  };
}
