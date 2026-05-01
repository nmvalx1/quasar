import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';

import { registerHealthRoutes } from './routes/health.routes.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });
  await registerHealthRoutes(app);
  return app;
}
