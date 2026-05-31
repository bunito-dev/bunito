import { EventEmitter } from 'node:events';
import { InternalException, warn } from '@bunito/common';
import type { ModuleLike, ResolveToken, Token } from '@bunito/container';
import { Container } from '@bunito/container';
import { Logger } from '@bunito/logger';
import { OnAppShutdown, OnAppStart } from './decorators';
import type { AppAction, AppEvents, AppOptions } from './types';

export class App extends EventEmitter<AppEvents> implements EventEmitter<AppEvents> {
  static async create(rootModule: ModuleLike, options: AppOptions = {}): Promise<App> {
    const container = new Container(rootModule);

    let logger: Logger | undefined;

    try {
      logger = await container.resolveProvider(Logger, {
        context: App,
      });
    } catch {
      warn(
        'Logger is not available in the App context',
        'import LoggerModule from @bunito/bunito for automatic logging',
      );
    }

    return new App(options, container, logger);
  }

  static async start(rootModule: ModuleLike, options?: AppOptions): Promise<App> {
    const app = await App.create(rootModule, options);

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
