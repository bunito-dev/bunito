import { App } from '../app';

export function testApp(this: Bunito.Test): typeof App {
  const LoggerModule = this.LoggerModule;
  const ConfigModule = this.ConfigModule;

  return class TestApp extends App {
    protected static override readonly defaultOptions = {
      silent: true,
    };

    protected static override readonly defaultModules = [ConfigModule, LoggerModule];
  };
}
