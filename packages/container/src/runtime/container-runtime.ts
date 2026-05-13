import { AsyncLocalStorage } from 'node:async_hooks';
import type { CallableInstance, Fn, MaybePromise, RawObject } from '@bunito/common';
import { InternalException, isFn, isObject, isString } from '@bunito/common';
import type {
  ContainerCompiler,
  InjectionLike,
  Injections,
  ModuleId,
  ProviderId,
} from '../compiler';
import { OnDestroy, OnInit, OnResolve } from '../decorators';
import type { TokenLike } from '../utils';
import { Id } from '../utils';
import {
  MODULE_ID,
  PARENT_MODULE_IDS,
  REQUEST_ID,
  REQUEST_ID_GETTER,
  REQUEST_STATE,
  ROOT_MODULE_ID,
} from './constants';
import { ProviderStore } from './provider-store';
import type { ResolveProviderOptions } from './types';

export class ContainerRuntime extends ProviderStore {
  private static requestCounter = 0;

  private readonly requestStorage = new AsyncLocalStorage<{
    id?: number;
    providers?: ProviderStore;
    state?: Map<unknown, unknown>;
  }>();

  constructor(private readonly compiler: ContainerCompiler) {
    super();
  }

  runInRequestContext<TResult = unknown>(
    contextHandler: Fn<Promise<TResult>>,
  ): Promise<TResult> {
    return this.requestStorage.run(
      {
        id: ++ContainerRuntime.requestCounter,
      },
      async () => {
        try {
          return await contextHandler();
        } finally {
          await this.requestStorage.getStore()?.providers?.destroyInstances?.();
        }
      },
    );
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

    const { moduleId: moduleIdOption = rootModuleId } = options;

    const provider = this.compiler.getProvider(providerId, orThrow);

    if (!provider) {
      if (orThrow) {
        InternalException.throw`Provider ${providerId} was not found`;
      }

      return;
    }

    let providerModuleId: ModuleId | undefined;

    if (provider.options.global || provider.moduleIds?.has(moduleIdOption)) {
      providerModuleId = provider.moduleId;
    }

    if (!providerModuleId) {
      if (orThrow) {
        InternalException.throw`Provider ${providerId} is not available in module ${moduleIdOption}`;
      }

      return;
    }

    if ('useValue' in provider.options) {
      return provider.options.useValue as TInstance;
    }

    const { scope = 'singleton', injects } = provider.options;

    let providerStore: ProviderStore | undefined;
    let moduleId: ModuleId | undefined;

    switch (scope) {
      case 'singleton':
        moduleId = providerModuleId;
        providerStore = this;
        break;

      case 'module':
        moduleId = moduleIdOption;
        providerStore = this;
        break;

      case 'request': {
        const requestStore = this.requestStorage.getStore();

        if (!requestStore) {
          if (orThrow) {
            InternalException.throw`Provider ${providerId} is not available outside request scope`;
          }

          return;
        }

        requestStore.providers ??= new ProviderStore();

        moduleId = moduleIdOption;
        providerStore = requestStore.providers;
        break;
      }

      case 'transient':
        break;
    }

    if (moduleId && providerStore) {
      instance = await providerStore.getInstance<TInstance>(providerId, {
        moduleId,
      });

      if (instance !== undefined) {
        return instance as TInstance;
      }
    }

    const args = await this.resolveInjections(injects, {
      ...options,
      moduleId: providerModuleId,
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

    if (moduleId && providerStore) {
      providerStore.setInstance(providerId, instance, {
        moduleId,
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
          return InternalException.throw`Handler @${handlerDecorator} for provider ${providerId} can only be called once`;
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

    const { moduleId = rootModuleId, providerOptions, injectionResolver } = options;

    switch (injection) {
      case MODULE_ID:
        return moduleId;

      case ROOT_MODULE_ID:
        return rootModuleId;

      case PARENT_MODULE_IDS:
        return this.compiler.getModule(moduleId).parents ?? null;

      case REQUEST_ID:
        return this.requestStorage.getStore()?.id ?? null;

      case REQUEST_ID_GETTER:
        return () => this.requestStorage.getStore()?.id;

      case REQUEST_STATE: {
        const requestStore = this.requestStorage.getStore();

        if (requestStore) {
          requestStore.state ??= new Map();
        }

        return requestStore?.state ?? null;
      }
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
      return InternalException.throw`Injection ${Id.for(token)} at ${pos} could not be resolved`;
    }

    return value ?? null;
  }
}
