import type { Class, Fn } from '@bunito/common';
import type { ModuleLike, ResolveToken } from '../container';
import { Container } from '../container';
import { Logger } from '../logger';

export class App {
  static async create(name: string, moduleLike: ModuleLike): Promise<App> {
    const container = new Container(moduleLike);
    const logger = await container.tryResolve(Logger);
    const app = new App(name, logger, container);

    logger?.trace('Stetting up...');
    await container.setup();
    logger?.info('Ready!');

    return app;
  }

  constructor(
    name: string,
    readonly logger: Logger | undefined,
    private readonly container: Container,
  ) {
    logger?.setContext(`App(${name})`);
    container.setInstance(App, this);
  }

  resolve<TToken extends Class | Fn>(token: TToken): Promise<ResolveToken<TToken>>;
  resolve<TInstance = unknown>(token: symbol | string): Promise<TInstance>;
  resolve(token: unknown): Promise<unknown> {
    return this.container.resolve(token);
  }

  tryResolve<TToken extends Class | Fn>(
    token: TToken,
  ): Promise<ResolveToken<TToken> | undefined>;
  tryResolve<TInstance = unknown>(token: symbol | string): Promise<TInstance | undefined>;
  tryResolve(token: unknown): Promise<unknown> {
    return this.container.tryResolve(token);
  }

  async boot(): Promise<boolean> {
    return this.wrapPromise(() => this.container.boot(), 'Booting...', 'Ready!');
  }

  async destroy(): Promise<boolean> {
    return this.wrapPromise(
      () => this.container.destroy(),
      'Destroying...',
      'Destroyed!',
    );
  }

  protected async wrapPromise(
    promiseFn: () => Promise<void>,
    traceMessage: string,
    successMessage: string,
  ): Promise<boolean> {
    this.logger?.trace(traceMessage);

    try {
      await promiseFn();
    } catch (error) {
      this.logger?.error(error);
      return false;
    }

    this.logger?.ok(successMessage);

    return true;
  }
}
