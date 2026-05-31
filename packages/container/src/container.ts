import type { Fn } from '@bunito/common';
import type { Injections, MatchedControllers, ModuleId, ModuleLike } from './compiler';
import { ContainerCompiler } from './compiler';
import type {
  ResolveInjectionsOptions,
  ResolveProviderOptions,
  ResolveProviderOptionsOrUndefined,
} from './runtime';
import { ContainerRuntime } from './runtime';
import type { ResolveToken, Token } from './utils';
import { Id } from './utils';

export class Container {
  private readonly compiler: ContainerCompiler;
  private readonly runtime: ContainerRuntime;

  constructor(rootModule: ModuleLike) {
    this.compiler = new ContainerCompiler(rootModule);
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

  getInstance<TToken extends Token>(
    token: TToken,
  ): Promise<ResolveToken<TToken> | undefined> {
    return this.runtime.getInstance(Id.for(token));
  }

  resolveProvider<TInstance>(
    token: Token<TInstance>,
    options: ResolveProviderOptionsOrUndefined,
  ): Promise<TInstance | undefined>;
  resolveProvider<TToken extends Token>(
    token: TToken,
    options: ResolveProviderOptionsOrUndefined,
  ): Promise<ResolveToken<TToken> | undefined>;
  resolveProvider<TInstance>(
    token: Token<TInstance>,
    options?: ResolveProviderOptions,
  ): Promise<TInstance>;
  resolveProvider<TToken extends Token>(
    token: TToken,
    options?: ResolveProviderOptions,
  ): Promise<ResolveToken<TToken>>;
  async resolveProvider(
    token: Token,
    options: Partial<ResolveProviderOptionsOrUndefined>,
  ): Promise<unknown> {
    const { context, moduleId, orThrow } = options;

    try {
      return await this.runtime.resolveProvider(Id.for(token), {
        moduleId,
        contextId: context ? Id.for(context) : undefined,
      });
    } catch (err) {
      if (orThrow !== false) {
        throw err;
      }
    }
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
