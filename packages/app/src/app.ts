import { EventEmitter } from 'node:events';
import { InternalException } from '@bunito/common';
import { ConfigModule } from '@bunito/config';
import type { ModuleLike, ResolveToken, Token } from '@bunito/container';
import { Container } from '@bunito/container';
import { Logger, LoggerModule } from '@bunito/logger';
import { OnAppShutdown, OnAppStart } from './decorators';
import type { AppAction, AppEvents, AppOptions } from './types';

export class App extends EventEmitter<AppEvents> implements EventEmitter<AppEvents> {
  protected static readonly defaultOptions: AppOptions = {
    silent: false,
  };

  protected static readonly defaultModules: ModuleLike[] = [ConfigModule, LoggerModule];

  static async create(rootModule: ModuleLike, options: AppOptions = {}): Promise<App> {
    const container = new Container({
      // biome-ignore lint/complexity/noThisInStatic: Need to use `this`
      imports: [rootModule, ...this.defaultModules],
    });

    const logger = await container.resolveProvider(Logger, {
      context: App,
    });

    return new App(
      {
        // biome-ignore lint/complexity/noThisInStatic: Need to use `this`
        ...this.defaultOptions,
        ...options,
      },
      container,
      logger,
    );
  }

  static async start(rootModule: ModuleLike, options?: AppOptions): Promise<App> {
    // biome-ignore lint/complexity/noThisInStatic: Need to use `this`
    const app = await this.create(rootModule, options);

    await app.start();

    return app;
  }

  constructor(
    protected readonly options: AppOptions,
    protected readonly container: Container,
    readonly logger: Logger | undefined,
  ) {
    super();
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
      if (!this.logger) {
        throw err;
      }

      this.logger.fatal(err);
    }
  }

  protected async triggerAction(action: AppAction): Promise<void> {
    const logger = this.logger?.track();

    try {
      switch (action) {
        case 'start':
          await this.container.triggerProviders(OnAppStart);
          break;

        case 'shutdown':
          await this.container.triggerProviders(OnAppShutdown);
          await this.container.destroyInstances();
          break;
      }

      this.emit('action', action);

      switch (action) {
        case 'start':
          this.emit('ready');

          if (!this.options.silent) {
            logger?.ok('Ready');
          }
          break;

        case 'shutdown':
          this.emit('shutdown');

          if (!this.options.silent) {
            logger?.ok('Shutdown');
          }
          break;
      }
    } catch (err) {
      if (!logger) {
        this.emit('error', err);
        return;
      }

      logger.fatal('Unhandled error', err);
    }

    this[action] = async () => {
      const err = new InternalException(`App ${action} can only be called once`);

      if (!this.logger) {
        throw err;
      }

      this.logger.fatal('Unhandled error', err);
    };
  }
}
