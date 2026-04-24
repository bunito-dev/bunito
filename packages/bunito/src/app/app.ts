import { RuntimeException } from '@bunito/common';
import { Container } from '@bunito/container';
import type {
  ModuleOptionsLike,
  ResolveProviderOptions,
  ResolveToken,
  Token,
} from '@bunito/container/internals';
import { Logger } from '@bunito/logger';

export class App {
  static async create(moduleOptions: ModuleOptionsLike): Promise<App> {
    const container = new Container(moduleOptions);
    const logger = await container.tryResolveProvider(Logger);

    logger?.setContext(App);

    return new App(container, logger);
  }

  static async start(moduleOptions: ModuleOptionsLike): Promise<App> {
    const app = await App.create(moduleOptions);
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
          await this.container.triggerProviders('OnBoot');
          trace?.ok('Ready');
          break;

        case 'shutdown':
          await this.container.destroyProviders();
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
