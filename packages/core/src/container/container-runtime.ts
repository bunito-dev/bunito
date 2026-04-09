import { isObject, NestedMap, str } from '@bunito/common';
import { RuntimeException } from '../exceptions';
import type { ContainerCompiler } from './container-compiler';
import { Id } from './id';
import { MODULE_ID, REQUEST_ID } from './predefined';
import type {
  CallableInstance,
  CompiledInjection,
  LifecycleHandler,
  LifecycleHandlers,
  LifecycleProps,
  ProviderId,
  ResolveProviderOptions,
  ScopeId,
  ScopeInstance,
} from './types';

export class ContainerRuntime {
  static SCOPE_ID = new Id('SCOPE_ID');

  private readonly scopeInstances = new NestedMap<ScopeId, ProviderId, ScopeInstance>();

  private readonly bootstrap: LifecycleHandler[] = [];

  constructor(private readonly compiler: ContainerCompiler) {}

  setInstance(providerId: ProviderId, instance: unknown): void {
    this.scopeInstances.set(ContainerRuntime.SCOPE_ID, providerId, {
      instance,
    });
  }

  async destroyScope(scopeId?: ScopeId): Promise<void> {
    if (!scopeId) {
      for (const scopeId of this.scopeInstances.keys()) {
        await this.destroyScope(scopeId);
      }

      return;
    }

    for (const { onDestroy } of this.scopeInstances.values(scopeId)) {
      await onDestroy?.();
    }

    this.scopeInstances.delete(scopeId);
  }

  async triggerBootstrap(): Promise<void> {
    await Promise.all(this.bootstrap.map((handler) => handler()));
  }

  async resolveProvider<TInstance>(
    providerId: ProviderId,
    options: ResolveProviderOptions,
  ): Promise<TInstance | undefined> {
    const scopeInstance = this.scopeInstances.get(ContainerRuntime.SCOPE_ID, providerId);

    if (scopeInstance) {
      await scopeInstance.onResolve?.();
      return scopeInstance.instance as TInstance;
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
      const scopeInstance = this.scopeInstances.get(scopeId, providerId);

      if (scopeInstance) {
        await scopeInstance.onResolve?.();
        return scopeInstance.instance as TInstance;
      }
    }

    let instance: unknown;
    let handlers: LifecycleHandlers;

    switch (provider.kind) {
      case 'class': {
        const { useClass, injects, lifecycle } = provider;

        const params = await this.resolveProviderParams(providerId, injects, {
          moduleId: providerModuleId,
          requestId,
        });

        instance = new useClass(...params);
        handlers = this.processLifecycleHandlers(instance, lifecycle);
        break;
      }

      case 'factory': {
        const { useFactory, injects } = provider;

        const params = await this.resolveProviderParams(providerId, injects, {
          moduleId: providerModuleId,
          requestId,
        });

        instance = useFactory(...params);
        handlers = {};
        break;
      }

      case 'value': {
        const { useValue } = provider;

        instance = useValue;
        handlers = {};
        break;
      }
    }

    const { onInit, onResolve, onDestroy } = handlers;

    if (scopeId && instance !== undefined) {
      this.scopeInstances.set(scopeId, providerId, {
        instance,
        onResolve,
        onDestroy,
      });
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
    injects: CompiledInjection[],
    options: ResolveProviderOptions,
  ): Promise<unknown[]> {
    const params: unknown[] = [];

    const { requestId, moduleId } = options;

    for (const [index, { providerId: injectionId, optional }] of injects.entries()) {
      let param: unknown;

      switch (injectionId) {
        case REQUEST_ID:
          param = requestId;
          break;

        case MODULE_ID:
          param = moduleId;
          break;

        default:
          param = await this.resolveProvider(injectionId, options);
      }

      if (param === undefined) {
        if (!optional) {
          throw new RuntimeException(
            str`Injection ${injectionId} for ${providerId} provider not found at #${index} in ${moduleId}`,
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
          callable[propKey] = () =>
            RuntimeException.reject(
              str`Provider ${instance} lifecycle event ${event} cannot be called twice`,
              {
                instance,
                event,
                propKey,
              },
            );
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
