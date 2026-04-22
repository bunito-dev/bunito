import { ContainerCompiler } from './container-compiler';
import { ContainerRuntime } from './container-runtime';
import { Id } from './id';
import type {
  ComponentDefinition,
  ComponentKey,
  ExtensionDefinition,
  ModuleId,
  ModuleOptionsLike,
  ProviderEventName,
  RequestId,
  ResolveProviderOptions,
  ResolveToken,
  Token,
} from './types';

export class Container {
  private readonly compiler: ContainerCompiler;

  private readonly runtime: ContainerRuntime;

  constructor(moduleOptionsLike: ModuleOptionsLike) {
    this.compiler = new ContainerCompiler(moduleOptionsLike);
    this.runtime = new ContainerRuntime(this.compiler);

    this.runtime.setProvider(Id.for(Container), this);
  }

  async destroyProviders(): Promise<void> {
    await this.runtime.destroyProviders();
  }

  async destroyRequest(requestId: RequestId): Promise<void> {
    await this.runtime.destroyProviders(requestId);
  }

  setProvider(token: Token, instance: unknown): void {
    this.runtime.setProvider(Id.for(token), instance);
  }

  triggerProviders(eventName: ProviderEventName): Promise<void> {
    return this.runtime.triggerProviders(eventName);
  }

  getExtensions<TOptions = unknown>(
    extensionKey: ComponentKey,
  ): ExtensionDefinition<TOptions>[] {
    return this.compiler.getExtensions(extensionKey) as ExtensionDefinition<TOptions>[];
  }

  getComponents<TOptions = unknown, TFieldOptions = unknown, TMethodOptions = unknown>(
    componentKey: ComponentKey,
    moduleId?: ModuleId,
  ): ComponentDefinition<TOptions, TFieldOptions, TMethodOptions>[] {
    return this.compiler.getComponents(componentKey, moduleId) as ComponentDefinition<
      TOptions,
      TFieldOptions,
      TMethodOptions
    >[];
  }

  resolveProvider<TInstance>(
    token: Token<TInstance>,
    options?: Partial<ResolveProviderOptions>,
  ): Promise<TInstance>;
  resolveProvider<TToken extends Token>(
    token: TToken,
    options?: Partial<ResolveProviderOptions>,
  ): Promise<ResolveToken<TToken>>;
  async resolveProvider(
    token: Token,
    options: ResolveProviderOptions = {},
  ): Promise<unknown> {
    return this.runtime.resolveProvider(Id.for(token), options);
  }

  tryResolveProvider<TInstance>(
    token: Token<TInstance>,
    options?: Partial<ResolveProviderOptions>,
  ): Promise<TInstance | undefined>;
  tryResolveProvider<TToken extends Token>(
    token: TToken,
    options?: Partial<ResolveProviderOptions>,
  ): Promise<ResolveToken<TToken> | undefined>;
  async tryResolveProvider(
    token: Token,
    options: ResolveProviderOptions = {},
  ): Promise<unknown> {
    return this.runtime.tryResolveProvider(Id.for(token), options);
  }
}
