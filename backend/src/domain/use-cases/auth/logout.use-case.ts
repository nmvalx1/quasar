import { ok, type Result } from '../../../shared/types/result.js';
import type { RefreshTokenRepository } from '../../repositories/refresh-token.repository.js';
import type { TokenService } from '../../services/token-service.js';

export interface LogoutInput {
  refreshToken: string;
}

export interface LogoutDeps {
  refreshTokenRepository: RefreshTokenRepository;
  tokenService: TokenService;
}

export class LogoutUseCase {
  constructor(private readonly deps: LogoutDeps) {}

  /// Идемпотентно: повторный logout с тем же токеном — успех.
  async execute(input: LogoutInput): Promise<Result<{ revoked: true }>> {
    const presentedHash = await this.deps.tokenService.hashRefreshToken(input.refreshToken);
    await this.deps.refreshTokenRepository.deleteByHash(presentedHash);
    return ok({ revoked: true });
  }
}
