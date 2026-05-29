import type { ModuleLike } from '@bunito/container';
import type { App } from '../app';
import { createApp } from './create-app';

export async function startApp(
  rootModule: ModuleLike,
  ...defaultModules: ModuleLike[]
): Promise<App> {
  const app = await createApp(rootModule, ...defaultModules);

  await app.start();

  return app;
}
