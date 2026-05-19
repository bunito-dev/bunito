import type { ModuleLike } from '@bunito/container';
import { defineTestFactory } from '@bunito/testing';
import { App } from '../app';

defineTestFactory('App', function TestApp() {
  const LoggerModule = this.LoggerModule;
  const ConfigModule = this.ConfigModule;

  return class TestApp extends App {
    protected static override readonly defaultModules: ModuleLike[] = [
      LoggerModule,
      ConfigModule,
    ];
  };
});
