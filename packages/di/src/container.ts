import type { Fn } from '@bunito/common';
import { ContainerCompiler } from './container-compiler';
import { ContainerRuntime } from './container-runtime';
import { Id } from './id';
import type { ClassPropOptionsSchema } from './metadata';
import type {
  ComponentKey,
  ComponentMatch,
  InjectionsLike,
  ModuleId,
  ModuleLike,
  RequestId,
  ResolveProviderParams,
  ResolveToken,
  Token,
} from './types';

export class Container {
  private readonly compiler: ContainerCompiler;

  private readonly runtime: ContainerRuntime;

  constructor(moduleLike: ModuleLike) {
    this.compiler = new ContainerCompiler(moduleLike);
    this.runtime = new ContainerRuntime(this.compiler);

    this.setProvider(Container, this);
  }

  setProvider(token: Token, instance: unknown): void {
    this.runtime.setProvider(Id.for(token), instance);
  }

  locateComponents<
    TOptionsSchema extends ClassPropOptionsSchema = ClassPropOptionsSchema,
  >(
    componentKey: ComponentKey,
    moduleId?: ModuleId,
  ): ComponentMatch<TOptionsSchema> | undefined {
    return this.compiler.locateComponents(componentKey, moduleId) as
      | ComponentMatch<TOptionsSchema>
      | undefined;
  }

  resolveProvider<TInstance>(
    token: Token<TInstance>,
    options?: Partial<ResolveProviderParams>,
  ): Promise<TInstance>;
  resolveProvider<TToken extends Token>(
    token: TToken,
    options?: Partial<ResolveProviderParams>,
  ): Promise<ResolveToken<TToken>>;
  async resolveProvider(
    token: Token,
    options: ResolveProviderParams = {},
  ): Promise<unknown> {
    return this.runtime.resolveProvider(Id.for(token), options, true);
  }

  tryResolveProvider<TInstance>(
    token: Token<TInstance>,
    options?: Partial<ResolveProviderParams>,
  ): Promise<TInstance | undefined>;
  tryResolveProvider<TToken extends Token>(
    token: TToken,
    options?: Partial<ResolveProviderParams>,
  ): Promise<ResolveToken<TToken> | undefined>;
  async tryResolveProvider(
    token: Token,
    options: ResolveProviderParams = {},
  ): Promise<unknown> {
    return this.runtime.resolveProvider(Id.for(token), options, false);
  }

  async resolveInjections(
    providerToken: Token,
    injections: InjectionsLike,
    options?: Partial<ResolveProviderParams>,
  ): Promise<unknown[]> {
    return this.runtime.resolveInjections(Id.for(providerToken), injections, options);
  }

  async triggerProviders(decorator: Fn): Promise<void> {
    for (const { providerId, moduleId } of this.compiler.locateProviders(decorator)) {
      const instance = await this.runtime.resolveProvider(providerId, { moduleId });

      const handler = this.runtime.createProviderHandler(providerId, instance, decorator);

      if (handler) {
        await handler();
      }
    }
  }

  async destroyProviders(): Promise<void> {
    await this.runtime.destroyProviders();
  }

  async destroyRequest(requestId: RequestId): Promise<void> {
    await this.runtime.destroyProviders(requestId);
  }
}
