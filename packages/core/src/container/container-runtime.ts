import { isObject, str } from '@bunito/common';
import { Container } from './container';
import type { ContainerCompiler } from './container-compiler';
import { ContainerRuntimeException } from './container-runtime.exception';
import { Id } from './id';
import type {
  CallableInstance,
  CompiledInjection,
  LifecycleHandler,
  LifecycleHandlers,
  LifecycleProps,
  ProviderId,
  ResolveProviderOptions,
  ScopedInstance,
  ScopeId,
} from './types';

export class ContainerRuntime {
  private readonly bootstrap: Array<LifecycleHandler> = [];

  private readonly globalInstances = new Map<ProviderId, unknown>();

  private readonly scopedInstances = new Map<ScopeId, Map<ProviderId, ScopedInstance>>();

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

    for (const { onDestroy } of instances.values()) {
      if (onDestroy) {
        await onDestroy();
      }
    }

    this.scopedInstances.delete(scopeId);
  }

  async triggerBootstrap(): Promise<void> {
    await Promise.all(this.bootstrap.map((handler) => handler()));
  }

  async resolveProvider<TInstance>(
    providerId: ProviderId,
    options: ResolveProviderOptions,
  ): Promise<TInstance | undefined> {
    let instance = this.globalInstances.get(providerId);

    if (instance !== undefined) {
      return instance as TInstance;
    }

    const { moduleId, requestId } = options;

    const providerMatch = this.compiler.locateProvider(providerId, moduleId);

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
      const scopedInstance = this.scopedInstances.get(scopeId)?.get(providerId);

      if (scopedInstance) {
        const { onResolve, instance } = scopedInstance;

        if (onResolve) {
          await onResolve();
        }

        return instance as TInstance;
      }
    }

    let lifecycleHandlers: LifecycleHandlers;

    switch (provider.kind) {
      case 'class': {
        const { useClass, injects, lifecycle } = provider;
        const params = await this.resolveProviderParams(providerId, injects, {
          moduleId: providerModuleId,
          requestId,
        });

        instance = new useClass(...params);
        lifecycleHandlers = this.processLifecycleHandlers(instance, lifecycle);
        break;
      }

      case 'factory': {
        const { useFactory, injects } = provider;
        const params = await this.resolveProviderParams(providerId, injects, {
          moduleId: providerModuleId,
          requestId,
        });

        instance = useFactory(...params);
        lifecycleHandlers = {};
        break;
      }

      case 'value': {
        const { useValue } = provider;

        instance = useValue;
        lifecycleHandlers = {};
        break;
      }
    }

    const { onInit, onResolve, onDestroy } = lifecycleHandlers;

    if (scopeId && instance !== undefined) {
      const scopedInstance: ScopedInstance = {
        instance,
        onResolve,
        onDestroy,
      };

      if (!this.scopedInstances.get(scopeId)?.set(providerId, scopedInstance)) {
        this.scopedInstances.set(scopeId, new Map([[providerId, scopedInstance]]));
      }
    }

    if (onInit) {
      await onInit();
    } else if (onResolve) {
      await onResolve();
    }

    return instance as TInstance;
  }

  private async resolveProviderParams(
    providerId: ProviderId,
    injects: Array<CompiledInjection>,
    options: ResolveProviderOptions,
  ): Promise<Array<unknown>> {
    const params: Array<unknown> = [];

    for (const [index, { providerId: injectionId, optional }] of injects.entries()) {
      let param = await this.resolveProvider(injectionId, options);

      if (param === undefined) {
        if (!optional) {
          throw new ContainerRuntimeException(
            str`Injection ${injectionId} for ${providerId} provider not found at #${index} in ${options.moduleId}`,
            {
              injectionId,
              providerId,
              index,
              options,
            },
          );
        }

        param = null;
      }

      params.push(param);
    }

    return params;
  }

  private processLifecycleHandlers(
    instance: unknown,
    props: LifecycleProps | undefined,
  ): LifecycleHandlers {
    if (!isObject(instance) || !props) {
      return {};
    }

    const callable = instance as CallableInstance;
    const handlers: LifecycleHandlers = {};

    for (const [event, propKey] of props) {
      const handler = async () => {
        if (callable[propKey]) {
          await callable[propKey]();
        }

        if (event !== 'onResolve') {
          callable[propKey] = () => {
            throw new ContainerRuntimeException(
              str`Provider ${instance} lifecycle event ${event} cannot be called twice`,
              {
                instance,
                event,
                propKey,
              },
            );
          };
        }
      };

      if (event === 'onBoot') {
        this.bootstrap.push(handler);
        props.delete(event);
      } else {
        handlers[event] = handler;
      }
    }

    return handlers;
  }
}
