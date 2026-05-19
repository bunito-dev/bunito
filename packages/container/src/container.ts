import type { Fn } from '@bunito/common';
import type { Injections, MatchedControllers, ModuleId, ModuleLike } from './compiler';
import { ContainerCompiler } from './compiler';
import type { ResolveInjectionsOptions, ResolveProviderOptions } from './runtime';
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

  runInRequestContext<TResult = unknown>(
    contextHandler: Fn<Promise<TResult>>,
  ): Promise<TResult> {
    return this.runtime.runInRequestContext(contextHandler);
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
    options?: ResolveProviderOptions,
  ): Promise<TInstance>;
  resolveProvider<TToken extends Token>(
    token: TToken,
    options?: ResolveProviderOptions,
  ): Promise<ResolveToken<TToken>>;
  resolveProvider(token: Token, options: ResolveProviderOptions = {}): Promise<unknown> {
    const { context, moduleId } = options;

    return this.runtime.resolveProvider(Id.for(token), {
      moduleId,
      contextId: context ? Id.for(context) : undefined,
    });
  }

  resolveInjections(
    injections: Injections,
    options: ResolveInjectionsOptions = {},
  ): Promise<unknown[]> {
    const { context, moduleId, injectionResolver } = options;

    return this.runtime.resolveInjections(injections, {
      moduleId,
      injectionResolver,
      contextId: context ? Id.for(context) : undefined,
    });
  }

  async destroyInstances(): Promise<void> {
    await this.runtime.destroyInstances();
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

  locateComponents<TClassOptions = unknown, TMethodOptions = unknown>(
    controllerKey: symbol,
    moduleId?: ModuleId,
  ): MatchedControllers<TClassOptions, TMethodOptions> | undefined {
    return this.compiler.locateControllers(controllerKey, moduleId) as MatchedControllers<
      TClassOptions,
      TMethodOptions
    >;
  }
}
