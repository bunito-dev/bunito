import type { Class } from '@bunito/common';
import { str } from '@bunito/common';
import { ContainerException } from './container.exception';
import { ContainerCompiler } from './container-compiler';
import { ContainerRuntime } from './container-runtime';
import { Id } from './id';
import type {
  ControllerNode,
  ModuleId,
  ModuleLike,
  ProviderId,
  ResolveProviderOptions,
  ResolveToken,
  Token,
} from './types';

export class Container {
  readonly controllers: ControllerNode[] = [];

  private readonly moduleId: ModuleId;

  constructor(
    moduleLike: ModuleLike,
    readonly compiler: ContainerCompiler = new ContainerCompiler(),
    readonly runtime: ContainerRuntime = new ContainerRuntime(compiler),
  ) {
    this.moduleId = compiler.compileModule(moduleLike);
    this.setInstance(Container, this);
  }

  async setup(): Promise<void> {
    for (const [providerId, moduleId] of this.processModule(this.moduleId)) {
      await this.runtime.resolveProvider(providerId, {
        moduleId,
      });
    }

    this.setup = () =>
      Promise.reject(new ContainerException('Container setup cannot be called twice'));
  }

  async boot(): Promise<void> {
    await this.runtime.triggerBootstrap();

    this.boot = () =>
      Promise.reject(new ContainerException('Container boot cannot be called twice'));
  }

  async destroy(): Promise<void> {
    await this.runtime.destroyScope();

    this.destroy = () =>
      Promise.reject(new ContainerException('Container destroy cannot be called twice'));
  }

  setInstance(token: Token, instance: unknown): void {
    this.runtime.setInstance(Id.for(token), instance);
  }

  resolve<TInstance>(
    token: Token<TInstance>,
    options?: Partial<ResolveProviderOptions>,
  ): Promise<TInstance>;
  resolve<TToken extends Token>(
    token: TToken,
    options?: Partial<ResolveProviderOptions>,
  ): Promise<ResolveToken<TToken>>;
  async resolve(
    token: unknown,
    options: Partial<ResolveProviderOptions> = {},
  ): Promise<unknown> {
    const instance = await this.tryResolve(token as Token, options);

    if (!instance) {
      throw new ContainerException(
        str`Could not resolve ${token} in ${this.moduleId} module`,
        {
          moduleId: this.moduleId,
          token,
        },
      );
    }

    return instance;
  }

  tryResolve<TInstance>(
    token: Token<TInstance>,
    options?: Partial<ResolveProviderOptions>,
  ): Promise<TInstance | undefined>;
  tryResolve<TToken extends Token>(
    token: TToken,
    options?: Partial<ResolveProviderOptions>,
  ): Promise<ResolveToken<TToken> | undefined>;
  tryResolve(
    token: unknown,
    options: Partial<ResolveProviderOptions> = {},
  ): Promise<unknown> {
    return this.runtime.resolveProvider(Id.for(token as Token), {
      moduleId: this.moduleId,
      ...options,
    });
  }

  private processModule(
    moduleId: ModuleId,
    requiredProviders: [ProviderId, ModuleId][] = [],
    parents: Class[] = [],
  ): [ProviderId, ModuleId][] {
    const { useClass, controllers, providers, imports } =
      this.compiler.getModule(moduleId);

    if (useClass) {
      parents.push(useClass);
    }

    for (const controllerId of controllers) {
      const providerMatch = this.compiler.locateProvider(controllerId, moduleId);

      if (!providerMatch) {
        continue;
      }

      const { provider } = providerMatch;

      if (provider.kind !== 'class') {
        continue;
      }

      this.controllers.push({
        moduleId,
        useClass: provider.useClass,
        parentClasses: parents,
      });
    }

    for (const importedModuleId of imports) {
      this.processModule(importedModuleId, requiredProviders, [...parents]);
    }

    for (const [providerId, provider] of providers) {
      if (provider.kind === 'class' && provider.lifecycle?.has('onBoot')) {
        requiredProviders.push([providerId, moduleId]);
      }
    }

    return requiredProviders;
  }
}
