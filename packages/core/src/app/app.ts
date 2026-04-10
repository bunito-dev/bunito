import type { Class, Fn } from '@bunito/common';
import type { ModuleLike, ResolveToken } from '../container';
import { Container } from '../container';
import { Logger } from '../logger';

export class App {
  static async create(moduleLike: ModuleLike, name?: string): Promise<App> {
    const container = new Container(moduleLike);
    const logger = await container.tryResolveProvider(Logger);

    const app = new App(name, logger, container);

    await app.runAction('setup', 'Initialized');

    return app;
  }

  constructor(
    name: string | undefined,
    readonly logger: Logger | undefined,
    private readonly container: Container,
  ) {
    logger?.setContext(App, name);
    container.setInstance(App, this);
  }

  resolve<TToken extends Class | Fn>(token: TToken): Promise<ResolveToken<TToken>>;
  resolve<TInstance = unknown>(token: symbol | string): Promise<TInstance>;
  resolve(token: unknown): Promise<unknown> {
    return this.container.resolveProvider(token);
  }

  tryResolve<TToken extends Class | Fn>(
    token: TToken,
  ): Promise<ResolveToken<TToken> | undefined>;
  tryResolve<TInstance = unknown>(token: symbol | string): Promise<TInstance | undefined>;
  tryResolve(token: unknown): Promise<unknown> {
    return this.container.tryResolveProvider(token);
  }

  async boot(): Promise<boolean> {
    return this.runAction('boot', 'Started');
  }

  async destroy(): Promise<boolean> {
    return this.runAction('destroy', 'Destroyed');
  }

  protected async runAction(
    action: 'setup' | 'boot' | 'destroy',
    message: string,
  ): Promise<boolean> {
    const trace = this.logger?.trace();

    try {
      await this.container[action]();
    } catch (error) {
      if (!trace) {
        throw error;
      }

      trace?.fatal(error);
      return false;
    }

    trace?.ok(message);

    return true;
  }
}
