import { describe, expect, it } from 'bun:test';
import { Test } from '@bunito/testing';
import { App } from '../app';
import './definitions';

describe('app testing definitions', () => {
  it('provides an app class with testing defaults', async () => {
    expect(Test.configService).toBeDefined();
    expect(Test.LoggerModule).toBeDefined();
    expect(Test.ConfigModule).toBeDefined();

    const TestApp = Test.App as typeof App;

    expect(TestApp).not.toBe(App);
    expect((TestApp as unknown as { defaultModules: unknown[] }).defaultModules).toEqual([
      Test.LoggerModule,
      Test.ConfigModule,
    ]);
    expect(
      Reflect.construct(TestApp as unknown as new (...args: never[]) => unknown, [
        {},
        {},
      ]),
    ).toBeInstanceOf(App);
    expect(await TestApp.create({})).toBeInstanceOf(App);
  });
});
