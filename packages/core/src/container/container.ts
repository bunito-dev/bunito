import type { Class, Fn } from '@bunito/common';
import { ContainerCompiler } from './container-compiler';
import { ContainerRuntime } from './container-runtime';
import { Id } from './id';
import type {
  ControllerNode,
  ModuleId,
  ModuleNode,
  ModuleRef,
  ResolveToken,
  ScopeId,
  Token,
} from './types';

export type ResolveOptions = {
  moduleId?: ModuleId;
  requestId?: ScopeId;
};

export class Container {
  private static readonly compiler = new ContainerCompiler();

  readonly controllers: Array<ControllerNode> = [];

  private readonly moduleId: ModuleId;

  private readonly moduleEntrypoints: Array<unknown> = [];

  constructor(
    moduleRef: ModuleRef,
    private readonly compiler: ContainerCompiler = Container.compiler,
    private readonly runtime: ContainerRuntime = new ContainerRuntime(compiler),
  ) {
    this.moduleId = compiler.compileModule(moduleRef);
    this.setInstance(Container, this);
  }

  async setupEntrypoints(): Promise<void> {
    const moduleNodes: Array<ModuleNode> = [];

    this.processModule(this.moduleId, moduleNodes);

    for (const { moduleId, entrypointId } of moduleNodes) {
      this.moduleEntrypoints.push(
        await this.runtime.resolveProvider(entrypointId, { moduleId }),
      );
    }
  }

  async bootstrapEntrypoints(): Promise<void> {
    await Promise.all(
      this.moduleEntrypoints.map((moduleInstance) =>
        this.runtime.triggerProviderHook(moduleInstance, 'bootstrap'),
      ),
    );
  }

  async destroyScopes(): Promise<void> {
    await this.runtime.destroyScope();
  }

  setInstance(token: Token, instance: unknown): void {
    this.runtime.setInstance(Id.for(token), instance);
  }

  resolveProvider<TInstance>(
    token: symbol | string,
    options?: Partial<ResolveOptions>,
  ): Promise<TInstance>;
  resolveProvider<TToken extends Class | Fn>(
    token: TToken,
    options?: Partial<ResolveOptions>,
  ): Promise<ResolveToken<TToken>>;
  resolveProvider(token: unknown, options?: Partial<ResolveOptions>): Promise<unknown>;
  resolveProvider(
    token: unknown,
    options: Partial<ResolveOptions> = {},
  ): Promise<unknown> {
    return this.runtime.resolveProvider(Id.for(token as Token), {
      moduleId: this.moduleId,
      ...options,
    });
  }

  tryResolveProvider<TInstance>(
    token: symbol | string,
    options?: Partial<ResolveOptions>,
  ): Promise<TInstance | undefined>;
  tryResolveProvider<TToken extends Class | Fn>(
    token: TToken,
    options?: Partial<ResolveOptions>,
  ): Promise<ResolveToken<TToken> | undefined>;
  tryResolveProvider(token: unknown, options?: Partial<ResolveOptions>): Promise<unknown>;
  tryResolveProvider(
    token: unknown,
    options: Partial<ResolveOptions> = {},
  ): Promise<unknown> {
    return this.runtime.tryResolveProvider(Id.for(token as Token), {
      moduleId: this.moduleId,
      ...options,
    });
  }

  private processModule(
    moduleId: ModuleId,
    moduleNodes: Array<ModuleNode>,
    controllerClassStack: Array<Class> = [],
  ): void {
    const { entrypointId, controllers, imports } = this.compiler.getModule(moduleId);

    if (entrypointId) {
      const providerMatch = this.compiler.tryLocateProvider(entrypointId, moduleId);

      if (providerMatch) {
        const { provider } = providerMatch;

        if (provider.kind === 'class') {
          controllerClassStack.push(provider.useClass);
        }
      }
    }

    for (const controllerId of controllers) {
      const providerMatch = this.compiler.tryLocateProvider(controllerId, moduleId);
      if (!providerMatch) {
        continue;
      }

      const { provider } = providerMatch;

      if (provider.kind === 'class') {
        this.controllers.push({
          moduleId,
          classStack: [...controllerClassStack, provider.useClass],
        });
      }
    }

    for (const importedModuleId of imports) {
      this.processModule(importedModuleId, moduleNodes, [...controllerClassStack]);
    }

    if (entrypointId) {
      moduleNodes.push({
        moduleId,
        entrypointId,
      });
    }
  }
}
