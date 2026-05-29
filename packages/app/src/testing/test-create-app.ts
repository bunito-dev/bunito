import { Container } from '@bunito/container';
import { Logger } from '@bunito/logger';
import { App } from '../app';
import type { AppFactory } from '../types';

export function testCreateApp(this: Bunito.Test): AppFactory {
  const LoggerModule = this.LoggerModule;
  const ConfigModule = this.ConfigModule;

  return async (rootModule, ...defaultModules) => {
    const container = new Container({
      imports: [rootModule, LoggerModule, ConfigModule, ...defaultModules],
    });

    const logger = await container.resolveProvider(Logger, {
      context: App,
    });

    return new App(container, logger);
  };
}
