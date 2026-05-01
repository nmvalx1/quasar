import 'dotenv/config';

import { buildApp } from './create-app.js';

async function main(): Promise<void> {
  const app = await buildApp();
  const port = Number(process.env.PORT) || 3001;
  const host = process.env.HOST ?? '0.0.0.0';
  await app.listen({ port, host });
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
