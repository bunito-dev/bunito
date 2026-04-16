import { isString, RuntimeException } from '@bunito/common';
import type {
  ModuleOptionsLike,
  ResolveProviderOptions,
  ResolveToken,
  Token,
} from '@bunito/container';
import { Container } from '@bunito/container';
import { Logger } from '../logger';

export class App {
  static async start(name: string, moduleOptions: ModuleOptionsLike): Promise<App>;
  static async start(moduleOptions: ModuleOptionsLike): Promise<App>;
  static async start(
    arg0: string | ModuleOptionsLike,
    arg1: ModuleOptionsLike = {},
  ): Promise<App> {
    const app = await App.create(arg0 as string, arg1);
    await app.start();
    return app;
  }

  static async create(name: string, moduleOptions: ModuleOptionsLike): Promise<App>;
  static async create(moduleOptions: ModuleOptionsLike): Promise<App>;
  static async create(
    arg0: string | ModuleOptionsLike,
    arg1: ModuleOptionsLike = {},
  ): Promise<App> {
    let moduleOptions: ModuleOptionsLike;
    let name: string | undefined;

    if (isString(arg0)) {
      name = arg0;
      moduleOptions = arg1;
    } else {
      moduleOptions = arg0;
    }

    const container = new Container(moduleOptions);
    const logger = await container.tryResolveProvider(Logger);

    logger?.setContext(App, name);

    return new App(container, logger);
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

  resolve<TInstance>(
    token: Token<TInstance>,
    options?: Partial<ResolveProviderOptions>,
  ): Promise<TInstance>;
  resolve<TToken extends Token>(
    token: TToken,
    options?: Partial<ResolveProviderOptions>,
  ): Promise<ResolveToken<TToken>>;
  async resolve(token: Token, options: ResolveProviderOptions = {}): Promise<unknown> {
    return this.container.resolveProvider(token, options);
  }

  protected async triggerAction(action: 'start' | 'shutdown'): Promise<void> {
    const trace = this.logger?.trace();

    try {
      switch (action) {
        case 'start':
          await this.container.boot();
          trace?.ok('Ready');
          break;

        case 'shutdown':
          await this.container.destroy();
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
      const err = new RuntimeException(`App ${action} cannot be called twice`);

      if (!this.logger) {
        throw err;
      }

      this.logger?.fatal('Unhandled Error', err);
    };
  }
}
