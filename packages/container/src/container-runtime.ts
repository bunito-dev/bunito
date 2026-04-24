import type { CallableInstance, Fn } from '@bunito/common';
import { isObject, RuntimeException } from '@bunito/common';
import {
  GLOBAL_SCOPE_ID,
  MODULE_ID,
  PARENT_MODULE_IDS,
  REQUEST_ID,
  ROOT_MODULE_ID,
} from './constants';
import type { ContainerCompiler } from './container-compiler';
import type {
  InjectionDefinition,
  ModuleId,
  ProviderEventName,
  ProviderEvents,
  ProviderId,
  ProviderInstanceDefinition,
  ProviderInstanceOptions,
  RequestId,
  ResolveProviderOptions,
  ScopeId,
} from './types';

export class ContainerRuntime {
  private readonly providers = new Map<
    ScopeId,
    Map<ProviderId, ProviderInstanceDefinition>
  >();

  constructor(private readonly compiler: ContainerCompiler) {
    //
  }

  async triggerProviders(eventName: ProviderEventName): Promise<void> {
    const handlers: Fn<Promise<void>>[] = [];

    await this.createProviderHandlers(this.compiler.rootModuleId, eventName, handlers);

    await Promise.all(handlers.map((handler) => handler()));
  }

  async destroyProviders(scopeId?: ScopeId): Promise<void> {
    if (!scopeId) {
      for (const scopeId of this.providers.keys()) {
        await this.destroyProviders(scopeId);
      }
      return;
    }

    const providers = this.providers.get(scopeId);

    if (!providers) {
      return;
    }

    for (const [providerId, { onDestroy }] of providers) {
      if (!onDestroy) {
        continue;
      }

      await onDestroy();

      providers.delete(providerId);
    }

    this.providers.delete(scopeId);
  }

  setProvider(
    providerId: ProviderId,
    instance: unknown,
    options: ProviderInstanceOptions = {},
  ): void {
    const { scopeId = GLOBAL_SCOPE_ID, onResolve, onDestroy } = options;

    this.providers
      .getOrInsertComputed(scopeId, () => new Map())
      .set(providerId, {
        instance,
        onResolve,
        onDestroy,
      });
  }

  async tryGetProvider(
    providerId: ProviderId,
    scopeId = GLOBAL_SCOPE_ID,
  ): Promise<unknown> {
    const scopeInstance = this.providers.get(scopeId)?.get(providerId);

    if (!scopeInstance) {
      return;
    }

    const { instance, onResolve } = scopeInstance;

    if (onResolve) {
      await onResolve();
    }

    return instance;
  }

  async resolveProvider(
    providerId: ProviderId,
    options: ResolveProviderOptions = {},
  ): Promise<unknown> {
    const { moduleId = this.compiler.rootModuleId, requestId } = options;

    const instance = await this.tryResolveProvider(providerId, {
      requestId,
      moduleId,
    });

    if (instance === undefined) {
      return RuntimeException.throw`Provider ${providerId} not found in ${moduleId} module`;
    }

    return instance;
  }

  async tryResolveProvider(
    providerId: ProviderId,
    options: ResolveProviderOptions = {},
  ): Promise<unknown> {
    let instance = await this.tryGetProvider(providerId);

    if (instance !== undefined) {
      return instance;
    }

    const { moduleId = this.compiler.rootModuleId } = options;

    switch (providerId) {
      case REQUEST_ID:
        return options.requestId;

      case MODULE_ID:
        return moduleId;

      case ROOT_MODULE_ID:
        return this.compiler.rootModuleId;

      case PARENT_MODULE_IDS:
        return this.compiler.getModule(moduleId).parents;
    }

    const [providerModuleId, description] = this.compiler.getProvider(
      providerId,
      moduleId,
    );

    if (!providerModuleId || !description) {
      return;
    }

    if ('useValue' in description) {
      return description.useValue;
    }

    const { scope, injects, events } = description;

    let scopeId: ScopeId | undefined;
    let requestId: RequestId | undefined;

    switch (scope) {
      case 'singleton':
        scopeId = providerModuleId;
        break;

      case 'module':
        scopeId = moduleId;
        break;

      case 'request':
        scopeId = options.requestId;
        requestId = options.requestId;
        break;

      default:
    }

    if (scopeId !== undefined) {
      instance = await this.tryGetProvider(providerId, scopeId);

      if (instance !== undefined) {
        return instance;
      }
    }

    const args = await this.resolveProviderArgs(providerId, injects, {
      requestId,
      moduleId: providerModuleId,
    });

    if ('useClass' in description) {
      instance = new description.useClass(...args);
    } else if ('useFactory' in description) {
      instance = await description.useFactory(...args);
    }

    if (instance === undefined) {
      return;
    }

    const onInit = this.createProviderHandler(instance, 'OnInit', events);
    const onResolve = this.createProviderHandler(instance, 'OnResolve', events);

    if (onInit) {
      await onInit();
    } else if (onResolve) {
      await onResolve();
    }

    if (scopeId !== undefined) {
      const onDestroy = this.createProviderHandler(instance, 'OnDestroy', events);

      this.setProvider(providerId, instance, { scopeId, onResolve, onDestroy });
    }

    return instance;
  }

  async resolveProviderArgs(
    providerId: ProviderId,
    injections: InjectionDefinition[],
    options: ResolveProviderOptions,
  ): Promise<unknown[]> {
    const args: unknown[] = [];

    for (const [
      index,
      { providerId: injectedProviderId, defaultValue },
    ] of injections.entries()) {
      const arg = await this.tryResolveProvider(injectedProviderId, options);

      if (arg !== undefined) {
        args.push(arg);
        continue;
      }

      if (defaultValue !== undefined) {
        args.push(defaultValue);
        continue;
      }

      return RuntimeException.throw`Missing ${injectedProviderId} at #${index} is ${providerId} provider`;
    }

    return args;
  }

  private createProviderHandler(
    instance: unknown,
    eventName: ProviderEventName,
    events: ProviderEvents | undefined,
  ): Fn<Promise<void>> | undefined {
    const options = events?.[eventName];

    if (!options) {
      return;
    }

    const { propKey, disposable } = options;

    const callableInstance = instance as CallableInstance<Promise<void>>;

    return async () => {
      if (!callableInstance[propKey]) {
        return;
      }

      await callableInstance[propKey]();

      if (!disposable) {
        return;
      }

      callableInstance[propKey] = () =>
        RuntimeException.reject`Provider handler ${propKey} cannot be called twice`;
    };
  }

  private async createProviderHandlers(
    moduleId: ModuleId,
    eventName: ProviderEventName,
    found: Fn<Promise<void>>[],
    instances = new WeakSet<object>(),
  ): Promise<void> {
    const { providers, children } = this.compiler.getModule(moduleId);

    for (const childId of children) {
      await this.createProviderHandlers(childId, eventName, found, instances);
    }

    for (const [providerId, { events }] of providers.definitions) {
      if (!events?.[eventName]) {
        continue;
      }

      const instance = await this.resolveProvider(providerId, {
        moduleId,
      });

      if (!isObject(instance) || instances.has(instance)) {
        continue;
      }

      instances.add(instance);

      const handler = this.createProviderHandler(instance, eventName, events);

      if (!handler) {
        continue;
      }

      found.push(handler);
    }
  }
}
