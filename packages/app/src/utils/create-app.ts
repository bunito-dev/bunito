import { ConfigModule } from '@bunito/config';
import type { ModuleLike } from '@bunito/container';
import { Container } from '@bunito/container';
import { Logger, LoggerModule } from '@bunito/logger';
import { App } from '../app';

export async function createApp(
  rootModule: ModuleLike,
  ...defaultModules: ModuleLike[]
): Promise<App> {
  const container = new Container({
    imports: [rootModule, ConfigModule, LoggerModule, ...defaultModules],
  });

  const logger = await container.resolveProvider(Logger, {
    context: App,
  });

  return new App(container, logger);
}
