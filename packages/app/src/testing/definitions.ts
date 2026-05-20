import type { ModuleLike } from '@bunito/container';
import { defineTestFactory } from '@bunito/testing';
import { App } from '../app';

class TestApp extends App {
  protected static override defaultModules: ModuleLike[] = [];

  protected constructor(container: never, logger: never) {
    super(container, logger);
  }

  static setDefaultModules(defaultModules: ModuleLike[]): void {
    TestApp.defaultModules = defaultModules;
  }
}

defineTestFactory('App', function TestAppFactory() {
  const LoggerModule = this.LoggerModule;
  const ConfigModule = this.ConfigModule;

  TestApp.setDefaultModules([LoggerModule, ConfigModule]);

  return TestApp;
});
