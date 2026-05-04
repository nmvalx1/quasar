import type { User } from '../../../src/domain/entities/user.entity.js';
import type { RefreshToken } from '../../../src/domain/entities/refresh-token.entity.js';
import type {
  CreateUserInput,
  UserRepository,
} from '../../../src/domain/repositories/user.repository.js';
import type {
  CreateRefreshTokenInput,
  RefreshTokenRepository,
} from '../../../src/domain/repositories/refresh-token.repository.js';
import type { PasswordHasher } from '../../../src/domain/services/password-hasher.js';
import type {
  AccessTokenPayload,
  IssuedTokens,
  TokenService,
} from '../../../src/domain/services/token-service.js';

let userIdCounter = 0;
let refreshIdCounter = 0;

export class InMemoryUserRepository implements UserRepository {
  private readonly byId = new Map<string, User>();
  private readonly byEmail = new Map<string, User>();

  seed(user: User): void {
    this.byId.set(user.id, user);
    this.byEmail.set(user.email.toLowerCase(), user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.byEmail.get(email.toLowerCase()) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.byId.get(id) ?? null;
  }

  async create(input: CreateUserInput): Promise<User> {
    userIdCounter += 1;
    const user: User = {
      id: `user-${userIdCounter}`,
      email: input.email.toLowerCase(),
      name: input.name ?? null,
      plan: 'free',
      passwordHash: input.passwordHash,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
    };
    this.byId.set(user.id, user);
    this.byEmail.set(user.email, user);
    return user;
  }
}

export class InMemoryRefreshTokenRepository implements RefreshTokenRepository {
  private readonly byHash = new Map<string, RefreshToken>();

  list(): RefreshToken[] {
    return Array.from(this.byHash.values());
  }

  async create(input: CreateRefreshTokenInput): Promise<RefreshToken> {
    refreshIdCounter += 1;
    const token: RefreshToken = {
      id: `rt-${refreshIdCounter}`,
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      createdAt: new Date('2026-01-01T00:00:00Z'),
    };
    this.byHash.set(input.tokenHash, token);
    return token;
  }

  async findByHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.byHash.get(tokenHash) ?? null;
  }

  async deleteByHash(tokenHash: string): Promise<void> {
    this.byHash.delete(tokenHash);
  }

  async deleteAllForUser(userId: string): Promise<void> {
    for (const [hash, token] of this.byHash) {
      if (token.userId === userId) this.byHash.delete(hash);
    }
  }
}

export class FakePasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return `hashed:${plain}`;
  }

  async verify(plain: string, hash: string): Promise<boolean> {
    return hash === `hashed:${plain}`;
  }
}

export interface FakeTokenServiceOptions {
  refreshTtlMs?: number;
  now?: () => Date;
}

export class FakeTokenService implements TokenService {
  private issued = 0;
  private readonly refreshTtlMs: number;
  private readonly now: () => Date;

  constructor(options: FakeTokenServiceOptions = {}) {
    this.refreshTtlMs = options.refreshTtlMs ?? 7 * 24 * 60 * 60 * 1000;
    this.now = options.now ?? (() => new Date());
  }

  async issueTokens(userId: string): Promise<IssuedTokens> {
    this.issued += 1;
    const accessToken = `access:${userId}:${this.issued}`;
    const refreshToken = `refresh:${userId}:${this.issued}`;
    return {
      accessToken,
      refreshToken,
      refreshTokenHash: `hashed-rt:${refreshToken}`,
      refreshTokenExpiresAt: new Date(this.now().getTime() + this.refreshTtlMs),
    };
  }

  async hashRefreshToken(refreshToken: string): Promise<string> {
    return `hashed-rt:${refreshToken}`;
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    const match = /^access:([^:]+):/.exec(token);
    if (!match) throw new Error('invalid token');
    return { userId: match[1] };
  }
}
