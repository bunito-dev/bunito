import type { Fn } from '@bunito/common';
import type { Injections, ModuleLike } from './compiler';
import { ContainerCompiler } from './compiler';
import type { RequestId, ResolveProviderOptions } from './runtime';
import { ContainerRuntime } from './runtime';
import type { ResolveToken, Token } from './utils';
import { Id } from './utils';

export class Container {
  private readonly compiler: ContainerCompiler;
  private readonly runtime: ContainerRuntime;

  constructor(moduleLike: ModuleLike) {
    this.compiler = new ContainerCompiler(moduleLike);
    this.runtime = new ContainerRuntime(this.compiler);

    this.setInstance(Container, this);
  }

  setInstance<TInstance = unknown>(token: Token, instance: TInstance): void {
    this.runtime.setInstance(Id.for(token), instance);
  }

  getInstance<TInstance>(token: Token<TInstance>): Promise<TInstance | undefined>;
  getInstance<TToken extends Token>(
    token: TToken,
  ): Promise<ResolveToken<TToken> | undefined>;
  getInstance(token: Token): Promise<unknown> {
    return this.runtime.getInstance(Id.for(token));
  }

  resolveProvider<TInstance>(
    token: Token<TInstance>,
    options?: Partial<ResolveProviderOptions>,
  ): Promise<TInstance>;
  resolveProvider<TToken extends Token>(
    token: TToken,
    options?: Partial<ResolveProviderOptions>,
  ): Promise<ResolveToken<TToken>>;
  resolveProvider(token: Token, options: ResolveProviderOptions = {}): Promise<unknown> {
    return this.runtime.resolveProvider(Id.for(token), options, true);
  }

  tryResolveProvider<TInstance>(
    token: Token<TInstance>,
    options?: Partial<ResolveProviderOptions>,
  ): Promise<TInstance | undefined>;
  tryResolveProvider<TToken extends Token>(
    token: TToken,
    options?: Partial<ResolveProviderOptions>,
  ): Promise<ResolveToken<TToken> | undefined>;
  tryResolveProvider(
    token: Token,
    options: ResolveProviderOptions = {},
  ): Promise<unknown> {
    return this.runtime.resolveProvider(Id.for(token), options, false);
  }

  resolveInjections(
    injections: Injections,
    options?: Partial<ResolveProviderOptions>,
  ): Promise<unknown[]> {
    return this.runtime.resolveInjections(injections, options);
  }

  async destroyInstances(): Promise<void> {
    await this.runtime.destroyInstances();
  }

  async destroyRequest(requestId: RequestId): Promise<void> {
    await this.runtime.destroyInstances(requestId);
  }

  async triggerProviders(handlerDecorator: Fn): Promise<void> {
    const providers = this.compiler.getProviders(handlerDecorator);

    if (!providers) {
      return;
    }

    for (const { providerId, moduleId } of providers) {
      const instance = await this.runtime.resolveProvider(providerId, {
        moduleId,
      });

      const handler = this.runtime.createProviderHandler(
        providerId,
        instance,
        handlerDecorator,
      );

      if (!handler) {
        continue;
      }

      await handler();
    }
  }
}
