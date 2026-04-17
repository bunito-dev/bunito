import type { CallableInstance, Fn } from '@bunito/common';
import { isObject, RuntimeException, str } from '@bunito/common';
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
  ProviderEvent,
  ProviderEvents,
  ProviderId,
  ProviderInstanceDefinition,
  ProviderInstanceOptions,
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

  async bootModule(): Promise<void> {
    const handlers: Fn<Promise<void>>[] = [];

    await this.createBootHandlers(this.compiler.rootModuleId, handlers);

    await Promise.all(handlers.map((handler) => handler()));
  }

  async destroyScopes(): Promise<void> {
    for (const scopeId of this.providers.keys()) {
      await this.destroyScope(scopeId);
    }
  }

  async destroyScope(scopeId: ScopeId): Promise<void> {
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
      throw new RuntimeException(
        str`Provider ${providerId} not found in ${moduleId} module`,
        {
          providerId,
          requestId,
          moduleId,
        },
      );
    }

    return instance;
  }

  async tryResolveProvider(
    providerId: ProviderId,
    options: ResolveProviderOptions = {},
  ): Promise<unknown> {
    const { moduleId = this.compiler.rootModuleId, requestId } = options;

    switch (providerId) {
      case REQUEST_ID:
        return requestId;

      case MODULE_ID:
        return moduleId;

      case ROOT_MODULE_ID:
        return this.compiler.rootModuleId;

      case PARENT_MODULE_IDS:
        return this.compiler.getModule(moduleId).parents;
    }

    let instance = await this.tryGetProvider(providerId);

    if (instance !== undefined) {
      return instance;
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

    switch (scope) {
      case 'singleton':
        scopeId = providerModuleId;
        break;

      case 'module':
        scopeId = moduleId;
        break;

      case 'request':
        scopeId = requestId;
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
      instance = description.useFactory(...args);
    }

    if (instance === undefined) {
      return;
    }

    const onInit = this.createProviderHandler(instance, 'onInit', events);
    const onResolve = this.createProviderHandler(instance, 'onResolve', events);

    if (onInit) {
      await onInit();
    } else if (onResolve) {
      await onResolve();
    }

    if (scopeId !== undefined) {
      const onDestroy = this.createProviderHandler(instance, 'onDestroy', events);

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

      throw new RuntimeException(
        str`Missing ${injectedProviderId} at #${index} is ${providerId} provider`,
        {
          index,
          providerId,
          injectedProviderId,
        },
      );
    }

    return args;
  }

  private createProviderHandler(
    instance: unknown,
    event: ProviderEvent,
    events: ProviderEvents | undefined,
  ): Fn<Promise<void>> | undefined {
    const propKey = events?.[event];
    if (!propKey) {
      return;
    }

    const callableInstance = instance as CallableInstance<Promise<void>>;

    return async () => {
      if (!callableInstance[propKey]) {
        return;
      }

      await callableInstance[propKey]();

      if (event === 'onResolve') {
        return;
      }

      callableInstance[propKey] = () =>
        RuntimeException.reject(str`Provider handler ${propKey} cannot be called twice`, {
          propKey,
          event,
        });
    };
  }

  private async createBootHandlers(
    moduleId: ModuleId,
    found: Fn<Promise<void>>[],
    instances = new WeakSet<object>(),
  ): Promise<void> {
    const { providers, children } = this.compiler.getModule(moduleId);

    for (const childId of children) {
      await this.createBootHandlers(childId, found, instances);
    }

    for (const [providerId, { events }] of providers.definitions) {
      if (!events?.onBoot) {
        continue;
      }

      const instance = await this.resolveProvider(providerId, {
        moduleId,
      });

      if (!isObject(instance) || instances.has(instance)) {
        continue;
      }

      instances.add(instance);

      const handler = this.createProviderHandler(instance, 'onBoot', events);

      if (!handler) {
        continue;
      }

      found.push(handler);
    }
  }
}
