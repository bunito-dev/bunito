import { EventEmitter } from 'node:events';
import { InternalException } from '@bunito/common';
import type { Container, ResolveToken, Token } from '@bunito/container';
import type { Logger } from '@bunito/logger';
import { OnAppShutdown, OnAppStart } from './decorators';
import type { AppAction, AppEvents } from './types';

export class App extends EventEmitter<AppEvents> implements EventEmitter<AppEvents> {
  constructor(
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
    const trace = this.logger?.track();

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
          trace?.ok('Ready');
          break;

        case 'shutdown':
          this.emit('shutdown');
          trace?.ok('Shutdown');
          break;
      }
    } catch (err) {
      if (!trace) {
        this.emit('error', err);
        return;
      }

      trace.fatal('Unhandled error', err);
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
