import type { Class } from '@bunito/common';
import { getDecoratorMetadata, isFn, isObject, resolveName } from '@bunito/common';
import { PROVIDER_HOOK_METADATA_KEYS } from './constants';
import { Container } from './container';
import type { ContainerCompiler } from './container-compiler';
import { ContainerRuntimeException } from './container-runtime.exception';
import { Id } from './id';
import type {
  ProviderHook,
  ProviderId,
  ProviderInjection,
  ProviderInstance,
  ResolveProviderOptions,
  ScopeId,
} from './types';

export class ContainerRuntime {
  private readonly globalInstances = new Map<ProviderId, unknown>();

  private readonly scopedInstances = new Map<ScopeId, Map<ProviderId, unknown>>();

  constructor(private readonly compiler: ContainerCompiler) {
    this.globalInstances.set(Id.for(Container), this);
  }

  setInstance(providerId: ProviderId, instance: unknown): void {
    this.globalInstances.set(providerId, instance);
  }

  async destroyScope(scopeId?: ScopeId): Promise<void> {
    if (!scopeId) {
      for (const scopeId of this.scopedInstances.keys()) {
        await this.destroyScope(scopeId);
      }
      return;
    }

    const instances = this.scopedInstances.get(scopeId);

    if (!instances) {
      return;
    }

    for (const instance of instances.values()) {
      await this.triggerProviderHook(instance, 'destroy');
    }
    this.scopedInstances.delete(scopeId);
  }

  async resolveProvider<TInstance>(
    providerId: ProviderId,
    options: ResolveProviderOptions,
  ): Promise<TInstance> {
    const provider = await this.tryResolveProvider<TInstance>(providerId, options);

    if (!provider) {
      throw new ContainerRuntimeException(
        `Provider ${providerId} not found in ${options.moduleId} module`,
      );
    }

    return provider;
  }

  async tryResolveProvider<TInstance>(
    providerId: ProviderId,
    options: ResolveProviderOptions,
  ): Promise<TInstance | undefined> {
    let instance = this.globalInstances.get(providerId);

    if (instance !== undefined) {
      return instance as TInstance;
    }

    const { moduleId, requestId } = options;

    const providerMatch = this.compiler.tryLocateProvider(providerId, moduleId);

    if (!providerMatch) {
      return;
    }

    const { provider, moduleId: providerModuleId } = providerMatch;

    let scopeId: ScopeId | undefined;

    switch (provider.kind === 'value' ? 'transient' : provider.scope) {
      case 'singleton':
        scopeId = providerModuleId;
        break;

      case 'module':
        scopeId = moduleId;
        break;

      case 'request':
        scopeId = requestId;
        break;
    }

    if (scopeId) {
      instance = this.scopedInstances.get(scopeId)?.get(providerId);
      if (instance !== undefined) {
        return instance as TInstance;
      }
    }

    switch (provider.kind) {
      case 'class': {
        const { useClass, injects } = provider;
        const params = await this.resolveProviderParams(providerId, injects, {
          moduleId: providerModuleId,
          requestId,
        });

        instance = new useClass(...params);

        await this.triggerProviderHook(instance, 'setup');
        break;
      }

      case 'factory': {
        const { useFactory, injects } = provider;
        const params = await this.resolveProviderParams(providerId, injects, {
          moduleId: providerModuleId,
          requestId,
        });

        instance = useFactory(...params);
        break;
      }

      case 'value': {
        const { useValue } = provider;

        instance = useValue;
        break;
      }
    }

    if (scopeId && instance !== undefined) {
      if (!this.scopedInstances.get(scopeId)?.set(providerId, instance)) {
        this.scopedInstances.set(scopeId, new Map([[providerId, instance]]));
      }
    }

    return instance as TInstance;
  }

  async triggerProviderHook(instance: unknown, hook: ProviderHook): Promise<void> {
    if (!isObject(instance)) {
      return;
    }

    const props = getDecoratorMetadata<Set<PropertyKey>>(
      instance.constructor as Class,
      PROVIDER_HOOK_METADATA_KEYS[hook],
    );

    if (!props) {
      return;
    }

    const provider = instance as ProviderInstance;

    for (const prop of props) {
      if (isFn(provider[prop])) {
        await provider[prop]();

        provider[prop] = () => {
          throw new ContainerRuntimeException(
            `Provider ${resolveName(instance)} hook ${hook} cannot be called twice`,
          );
        };
      }
    }
  }

  private async resolveProviderParams(
    providerId: ProviderId,
    injects: Array<ProviderInjection>,
    options: ResolveProviderOptions,
  ): Promise<Array<unknown>> {
    const params: Array<unknown> = [];

    for (const [index, { providerId: injectionId, optional }] of injects.entries()) {
      let param = await this.tryResolveProvider(injectionId, options);

      if (param === undefined) {
        if (!optional) {
          throw new ContainerRuntimeException(
            `Injection ${injectionId} for ${providerId} provider not found at #${index} in ${options.moduleId}`,
          );
        }

        param = null;
      }

      params.push(param);
    }

    return params;
  }
}
