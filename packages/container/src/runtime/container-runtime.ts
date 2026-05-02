import type { CallableInstance, Fn, MaybePromise, RawObject } from '@bunito/common';
import { isFn, isObject, isString } from '@bunito/common';
import type {
  ContainerCompiler,
  InjectionLike,
  Injections,
  ModuleId,
  ProviderId,
} from '../compiler';
import { ContainerException } from '../container.exception';
import { OnDestroy, OnInit, OnResolve } from '../decorators';
import type { TokenLike } from '../utils';
import { Id } from '../utils';
import {
  GLOBAL_SCOPE_ID,
  MODULE_ID,
  PARENT_MODULE_IDS,
  PROVIDER_OPTIONS,
  REQUEST_ID,
  ROOT_MODULE_ID,
} from './constants';
import type {
  GetInstanceOptions,
  InstanceDefinition,
  RequestId,
  ResolveProviderOptions,
  ScopeId,
  SetInstanceInstanceOptions,
} from './types';

export class ContainerRuntime {
  private readonly instances = new Map<ScopeId, Map<ProviderId, InstanceDefinition>>();

  constructor(private readonly compiler: ContainerCompiler) {}

  async getInstance<TInstance = unknown>(
    providerId: ProviderId,
    options: GetInstanceOptions = {},
  ): Promise<TInstance | undefined> {
    const { scopeId = GLOBAL_SCOPE_ID } = options;

    const definition = this.instances.get(scopeId)?.get(providerId);

    if (definition === undefined) {
      return;
    }

    const { onResolve, instance } = definition;

    if (onResolve) {
      await onResolve();
    }

    return instance as TInstance;
  }

  setInstance<TInstance = unknown>(
    providerId: ProviderId,
    instance: TInstance,
    options: SetInstanceInstanceOptions = {},
  ): void {
    const { scopeId = GLOBAL_SCOPE_ID, ...instanceOptions } = options;

    this.instances
      .getOrInsertComputed(scopeId, () => new Map())
      .set(providerId, {
        instance,
        ...instanceOptions,
      });
  }

  async destroyInstances(scopeId?: ScopeId): Promise<number> {
    let destroyed = 0;

    if (!scopeId) {
      for (const scopeId of this.instances.keys()) {
        destroyed += await this.destroyInstances(scopeId);
      }
    } else {
      const providers = this.instances.get(scopeId);

      if (providers) {
        for (const { onDestroy } of providers.values()) {
          if (onDestroy) {
            await onDestroy();
          }
        }

        destroyed = providers.size;

        this.instances.delete(scopeId);
      }
    }

    return destroyed;
  }

  async resolveProvider<TInstance = unknown>(
    providerId: ProviderId,
    options: ResolveProviderOptions = {},
    orThrow = true,
  ): Promise<TInstance | undefined> {
    let instance = await this.getInstance(providerId);

    if (instance !== undefined) {
      return instance as TInstance;
    }

    const { rootModuleId } = this.compiler;

    const { moduleId = rootModuleId } = options;

    const provider = this.compiler.getProvider(providerId, orThrow);

    if (!provider) {
      if (orThrow) {
        return ContainerException.throw`Provider ${providerId} was not found`;
      }

      return;
    }

    let providerModuleId: ModuleId | undefined;

    if (provider.options.global || provider.moduleIds?.has(moduleId)) {
      providerModuleId = provider.moduleId;
    }

    if (!providerModuleId) {
      if (orThrow) {
        return ContainerException.throw`Provider ${providerId} is not available in module ${moduleId}`;
      }

      return;
    }

    if ('useValue' in provider.options) {
      return provider.options.useValue as TInstance;
    }

    const { scope = 'singleton', injects } = provider.options;

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
    }

    if (scopeId) {
      instance = await this.getInstance<TInstance>(providerId, {
        scopeId,
      });

      if (instance !== undefined) {
        return instance as TInstance;
      }
    }

    const args = await this.resolveInjections(injects, {
      ...options,
      moduleId: providerModuleId,
      requestId,
    });

    if ('useClass' in provider.options) {
      instance = new provider.options.useClass(...args);
    } else if ('useFactory' in provider.options) {
      instance = await provider.options.useFactory(...args);
    }

    if (instance === undefined) {
      return;
    }

    const onInit = this.createProviderHandler(providerId, instance, OnInit);
    const onResolve = this.createProviderHandler(providerId, instance, OnResolve, false);
    const onDestroy = this.createProviderHandler(providerId, instance, OnDestroy);

    if (onInit) {
      await onInit();
    } else if (onResolve) {
      await onResolve();
    }

    if (scopeId) {
      this.setInstance(providerId, instance, {
        scopeId,
        onResolve,
        onDestroy,
      });
    }

    return instance as TInstance;
  }

  createProviderHandler(
    providerId: ProviderId,
    instance: unknown,
    handlerDecorator: Fn,
    disposable = true,
  ): Fn<Promise<void>> | undefined {
    if (!isObject<CallableInstance<MaybePromise>>(instance)) {
      return;
    }

    const { moduleId, handlers } = this.compiler.getProvider(providerId, true);

    const handlerOptions = handlers?.get(handlerDecorator);

    if (!handlerOptions) {
      return;
    }

    const { propKey, injects } = handlerOptions;

    return async () => {
      if (instance[propKey]) {
        const args = await this.resolveInjections(injects, {
          moduleId,
        });

        await instance[propKey](...args);
      }

      if (disposable) {
        instance[propKey] = () => {
          return ContainerException.throw`Handler @${handlerDecorator} for provider ${providerId} can only be called once`;
        };
      }
    };
  }

  async resolveInjections(
    injections: Injections | undefined,
    options: ResolveProviderOptions = {},
  ): Promise<unknown[]> {
    const args: unknown[] = [];

    if (Array.isArray(injections)) {
      for (const [index, injection] of injections.entries()) {
        args.push(await this.resolveInjection(`#${index}`, injection, options));
      }
    } else if (isObject(injections)) {
      const arg: RawObject = {};

      for (const [key, injection] of Object.entries(injections)) {
        arg[key] = await this.resolveInjection(`.${key}`, injection, options);
      }

      args.push(arg);
    }

    return args;
  }

  private async resolveInjection(
    pos: string,
    injection: InjectionLike,
    options: ResolveProviderOptions,
  ): Promise<unknown> {
    const { rootModuleId } = this.compiler;

    const {
      requestId,
      moduleId = rootModuleId,
      providerOptions,
      injectionResolver,
    } = options;

    switch (injection) {
      case MODULE_ID:
        return moduleId;

      case ROOT_MODULE_ID:
        return rootModuleId;

      case PARENT_MODULE_IDS:
        return this.compiler.getModule(moduleId).parents ?? null;

      case REQUEST_ID:
        return requestId ?? null;

      case PROVIDER_OPTIONS:
        return providerOptions ?? null;
    }

    if (isString(injection, false)) {
      return injection;
    }

    let token: TokenLike | undefined;
    let tokenOptions: unknown;

    let optional = false;

    if (isObject(injection)) {
      if ('useValue' in injection) {
        return injection.useValue;
      }

      if ('useBuilder' in injection) {
        return injection.useBuilder(injection.options);
      }

      if ('optional' in injection) {
        optional = !!injection.optional;
      }

      if ('useToken' in injection) {
        token = injection.useToken;
        tokenOptions = injection.options;
      }
    }

    token ??= injection;

    if (injectionResolver) {
      const resolved = await injectionResolver(token, tokenOptions);

      if (resolved !== undefined) {
        return resolved;
      }
    }

    let value: unknown;

    if (isFn(token)) {
      const providers = this.compiler.getProviders(token);

      if (providers) {
        const instances: unknown[] = [];

        for (const { providerId, moduleId } of providers) {
          instances.push(
            await this.resolveProvider(providerId, {
              ...options,
              moduleId,
              requestId,
            }),
          );
        }

        value = instances;
      }
    }

    if (value === undefined) {
      value = await this.resolveProvider(
        Id.for(token),
        {
          ...options,
          moduleId,
          providerOptions: tokenOptions ?? providerOptions,
        },
        false,
      );
    }

    if (value === undefined && !optional) {
      return ContainerException.throw`Injection ${injection} at ${pos} could not be resolved`;
    }

    return value ?? null;
  }
}
