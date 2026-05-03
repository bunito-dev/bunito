import { Container } from '@bunito/container';
import type { ModuleLike, ResolveToken, Token } from '@bunito/container/internals';
import { Logger } from '@bunito/logger';
import { AppException } from './app.exception';
import { OnAppShutdown, OnAppStart } from './decorators';

export class App {
  static async create(moduleLike: ModuleLike): Promise<App> {
    const container = new Container(moduleLike);
    const logger = await container.tryResolveProvider(Logger);

    logger?.setContext(App);

    return new App(container, logger);
  }

  static async start(moduleLike: ModuleLike): Promise<App> {
    const app = await App.create(moduleLike);
    await app.start();
    return app;
  }

  protected constructor(
    protected readonly container: Container,
    readonly logger: Logger | undefined,
  ) {
    //
  }

  async start(): Promise<void> {
    await this.triggerAction('start');
  }

  async shutdown(): Promise<void> {
    await this.triggerAction('shutdown');
  }

  resolve<TInstance>(token: Token<TInstance>): Promise<TInstance>;
  resolve<TToken extends Token>(token: TToken): Promise<ResolveToken<TToken>>;
  async resolve(token: Token): Promise<unknown> {
    return this.container.resolveProvider(token, {});
  }

  protected async triggerAction(action: 'start' | 'shutdown'): Promise<void> {
    const trace = this.logger?.trace();

    try {
      switch (action) {
        case 'start':
          await this.container.triggerProviders(OnAppStart);
          trace?.ok('Ready');
          break;

        case 'shutdown':
          await this.container.triggerProviders(OnAppShutdown);
          await this.container.destroyInstances();
          trace?.debug('Shutdown');
          break;
      }
    } catch (err) {
      if (!trace) {
        throw err;
      }

      trace?.fatal('Unhandled Error', err);
      return;
    }

    this[action] = async () => {
      const err = new AppException(`App ${action} can only be called once`);

      if (!this.logger) {
        throw err;
      }

      this.logger?.fatal('Unhandled Error', err);
    };
  }
}
