import { InternalException } from '@bunito/common';
import { ConfigModule } from '@bunito/config';
import type { ModuleLike, ResolveToken, Token } from '@bunito/container';
import { Container } from '@bunito/container';
import { Logger, LoggerModule } from '@bunito/logger';
import { OnAppShutdown, OnAppStart } from './decorators';

export class App {
  protected static readonly defaultModules: ModuleLike[] = [LoggerModule, ConfigModule];

  static async create(moduleLike: ModuleLike): Promise<App> {
    const container = new Container({
      // biome-ignore lint/complexity/noThisInStatic: Need to use `this`
      imports: [...this.defaultModules, moduleLike],
    });

    const logger = await container.resolveProvider(Logger, {
      context: App,
    });

    return new App(container, logger);
  }

  static async start(moduleLike: ModuleLike): Promise<App> {
    // biome-ignore lint/complexity/noThisInStatic: Need to use `this`
    const app = await this.create(moduleLike);

    await app.start();

    return app;
  }

  protected constructor(
    protected readonly container: Container,
    readonly logger: Logger,
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
    try {
      return this.container.resolveProvider(token, {});
    } catch (err) {
      this.logger.fatal(err);
    }
  }

  protected async triggerAction(action: 'start' | 'shutdown'): Promise<void> {
    const trace = this.logger.track();

    try {
      switch (action) {
        case 'start':
          await this.container.triggerProviders(OnAppStart);
          trace.ok('Ready');
          break;

        case 'shutdown':
          await this.container.triggerProviders(OnAppShutdown);
          await this.container.destroyInstances();
          trace.debug('Shutdown');
          break;
      }
    } catch (err) {
      trace.fatal('Unhandled Error', err);
    }

    this[action] = async () => {
      const err = new InternalException(`App ${action} can only be called once`);
      this.logger.fatal('Unhandled Error', err);
    };
  }
}
