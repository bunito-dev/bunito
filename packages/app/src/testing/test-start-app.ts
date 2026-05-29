import type { AppFactory } from '../types';

export function testStartApp(this: Bunito.Test): AppFactory {
  return async (rootModule, ...defaultModules) => {
    const app = await this.createApp(rootModule, ...defaultModules);

    await app.start();

    return app;
  };
}
