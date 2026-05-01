import type { FastifyInstance } from 'fastify';

import { prisma } from '../../infrastructure/database/prisma-client.js';

export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async () => ({ status: 'ok' as const }));

  app.get('/health/ready', async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: 'ready' as const, database: 'up' as const };
    } catch {
      return reply.status(503).send({
        status: 'not_ready' as const,
        database: 'down' as const,
      });
    }
  });
}
