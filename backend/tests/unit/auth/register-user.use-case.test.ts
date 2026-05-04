import { makeRegisterUserTestContext, makeUser } from './auth-test-fixtures.js';

describe('RegisterUserUseCase', () => {
  it('создаёт пользователя на Free плане, хеширует пароль и выдаёт пару токенов', async () => {
    const { useCase, refreshTokenRepository } = makeRegisterUserTestContext();

    const result = await useCase.execute({
      email: 'qa@quasar.test',
      password: 'super-secret-pass',
      name: 'QA Engineer',
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.user.email).toBe('qa@quasar.test');
    expect(result.data.user.plan).toBe('free');
    expect(result.data.user.passwordHash).toBe('hashed:super-secret-pass');

    expect(result.data.tokens.accessToken).toMatch(/^access:/);
    expect(result.data.tokens.refreshToken).toMatch(/^refresh:/);

    const persisted = refreshTokenRepository.list();
    expect(persisted).toHaveLength(1);
    expect(persisted[0].tokenHash).toBe(result.data.tokens.refreshTokenHash);
    expect(persisted[0].userId).toBe(result.data.user.id);
  });

  it('нормализует email к нижнему регистру и обрезает пробелы', async () => {
    const { useCase, userRepository } = makeRegisterUserTestContext();

    const result = await useCase.execute({
      email: '  Mixed@QUASAR.test  ',
      password: 'super-secret-pass',
    });

    expect(result.success).toBe(true);
    expect(await userRepository.findByEmail('mixed@quasar.test')).not.toBeNull();
  });

  it('возвращает EMAIL_ALREADY_EXISTS если email уже занят (без перезаписи пользователя)', async () => {
    const { useCase, userRepository, refreshTokenRepository } = makeRegisterUserTestContext();
    userRepository.seed(
      makeUser({ id: 'existing', email: 'taken@quasar.test', passwordHash: 'hashed:old' }),
    );

    const result = await useCase.execute({
      email: 'taken@quasar.test',
      password: 'new-password',
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.code).toBe('EMAIL_ALREADY_EXISTS');
    expect(result.error.statusCode).toBe(409);
    expect(refreshTokenRepository.list()).toHaveLength(0);

    const stored = await userRepository.findByEmail('taken@quasar.test');
    expect(stored?.passwordHash).toBe('hashed:old');
  });
});
