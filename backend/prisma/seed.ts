import {
  PaymentProvider,
  PrismaClient,
  SubscriptionStatus,
  UserPlan,
} from '@prisma/client';

const prisma = new PrismaClient();

const SEED_TEST_EMAIL = 'test@quasar.local';

async function main() {
  const user =
    (await prisma.user.findUnique({ where: { email: SEED_TEST_EMAIL } })) ??
    (await prisma.user.create({
      data: {
        email: SEED_TEST_EMAIL,
        name: 'Test QA Engineer',
        plan: UserPlan.free,
        passwordHash: null,
      },
    }));

  const hasFreeSubscription = await prisma.subscription.findFirst({
    where: { userId: user.id, plan: UserPlan.free, status: SubscriptionStatus.active },
  });

  if (!hasFreeSubscription) {
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: UserPlan.free,
        status: SubscriptionStatus.active,
        currentPeriodStart: new Date(),
        currentPeriodEnd: null,
        paymentProvider: PaymentProvider.none,
        externalId: null,
      },
    });
  }

  console.log('✅ Seed: test user + Free subscription ready');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
