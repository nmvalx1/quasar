import { makeRefreshTokenTestContext } from './auth-test-fixtures.js';

describe('RefreshTokenUseCase', () => {
  it('rotation: выдаёт новую пару, удаляет старый refresh, сохраняет новый', async () => {
    const { useCase, refreshTokenRepository, initial } = await makeRefreshTokenTestContext();

    const result = await useCase.execute({ refreshToken: initial.refreshToken });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const stored = refreshTokenRepository.list();
    expect(stored).toHaveLength(1);
    expect(stored[0].tokenHash).toBe(result.data.tokens.refreshTokenHash);
    expect(stored[0].tokenHash).not.toBe(initial.refreshTokenHash);
  });

  it('возвращает INVALID_REFRESH_TOKEN если токен неизвестен', async () => {
    const { useCase, refreshTokenRepository } = await makeRefreshTokenTestContext();

    const result = await useCase.execute({ refreshToken: 'refresh:user-1:does-not-exist' });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('INVALID_REFRESH_TOKEN');
    // существующий валидный токен не тронут
    expect(refreshTokenRepository.list()).toHaveLength(1);
  });

  it('истёкший refresh: ошибка + удаление протухшей записи', async () => {
    const { useCase, refreshTokenRepository, initial, now } = await makeRefreshTokenTestContext();
    const wayLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    const result = await useCase.execute({
      refreshToken: initial.refreshToken,
      now: wayLater,
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('INVALID_REFRESH_TOKEN');
    expect(refreshTokenRepository.list()).toHaveLength(0);
  });

  it('повторное использование уже использованного токена не работает (rotation защита)', async () => {
    const { useCase, refreshTokenRepository, initial } = await makeRefreshTokenTestContext();

    const first = await useCase.execute({ refreshToken: initial.refreshToken });
    expect(first.success).toBe(true);

    const replay = await useCase.execute({ refreshToken: initial.refreshToken });
    expect(replay.success).toBe(false);
    if (replay.success) return;
    expect(replay.error.code).toBe('INVALID_REFRESH_TOKEN');

    // в БД остался ровно один (новый) refresh
    expect(refreshTokenRepository.list()).toHaveLength(1);
  });
});
