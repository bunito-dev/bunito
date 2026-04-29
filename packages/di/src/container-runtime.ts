import type { CallableInstance, Fn, MaybePromise, RawObject } from '@bunito/common';
import { isObject, isString, RuntimeException } from '@bunito/common';
import {
  GLOBAL_SCOPE_ID,
  MODULE_ID,
  PARENT_MODULE_IDS,
  PARENT_PROVIDER_ID,
  PROVIDER_OPTIONS,
  REQUEST_ID,
  ROOT_MODULE_ID,
} from './constants';
import type { ContainerCompiler } from './container-compiler';
import { OnDestroy, OnInit, OnResolve } from './decorators';
import { Id } from './id';
import { getClassMetadata } from './metadata';
import type {
  GetProviderInstanceParams,
  InjectionLike,
  InjectionsLike,
  ModuleId,
  ProviderGroup,
  ProviderHandlerFn,
  ProviderHandlerSchema,
  ProviderId,
  ProviderInstance,
  RequestId,
  ResolveProviderParams,
  ScopeId,
  SetProviderInstanceParams,
  TokenLike,
} from './types';

export class ContainerRuntime {
  private readonly providers = new Map<ScopeId, Map<ProviderId, ProviderInstance>>();

  constructor(private readonly compiler: ContainerCompiler) {}

  async getProvider<TInstance = unknown>(
    providerId: ProviderId,
    params: GetProviderInstanceParams = {},
  ): Promise<TInstance | undefined> {
    const { scopeId = GLOBAL_SCOPE_ID } = params;

    const provider = this.providers.get(scopeId)?.get(providerId);

    if (provider === undefined) {
      return;
    }

    const { onResolve, instance } = provider;

    if (onResolve) {
      await onResolve();
    }

    return instance as TInstance;
  }

  setProvider<TInstance = unknown>(
    providerId: ProviderId,
    instance: TInstance,
    params: SetProviderInstanceParams = {},
  ): void {
    const { scopeId = GLOBAL_SCOPE_ID, ...options } = params;

    this.providers
      .getOrInsertComputed(scopeId, () => new Map())
      .set(providerId, {
        instance,
        ...options,
      });
  }

  async destroyProviders(scopeId?: ScopeId): Promise<number> {
    let result = 0;

    if (!scopeId) {
      for (const scopeId of this.providers.keys()) {
        result += await this.destroyProviders(scopeId);
      }
    } else {
      const providers = this.providers.get(scopeId);

      if (providers) {
        for (const { onDestroy } of providers.values()) {
          if (onDestroy) {
            await onDestroy();
          }
        }

        result = providers.size;

        this.providers.delete(scopeId);
      }
    }

    return result;
  }

  async resolveProvider<TInstance = unknown>(
    providerId: ProviderId,
    params: ResolveProviderParams = {},
    orThrow = true,
  ): Promise<TInstance | undefined> {
    let instance = await this.getProvider(providerId);

    if (instance !== undefined) {
      return instance as TInstance;
    }

    const { rootModuleId } = this.compiler;

    const { moduleId = rootModuleId } = params;

    const provider = this.compiler.getProvider(providerId, orThrow);

    if (!provider) {
      if (orThrow) {
        return RuntimeException.throw`Provider ${providerId} was not found`;
      }

      return;
    }

    let providerModuleId: ModuleId | undefined;

    if (provider.schema.global || provider.moduleIds?.has(moduleId)) {
      providerModuleId = provider.moduleId;
    }

    if (!providerModuleId) {
      if (orThrow) {
        return RuntimeException.throw`Provider ${providerId} was not found in ${moduleId} module`;
      }

      return;
    }

    if ('useValue' in provider.schema) {
      return provider.schema.useValue as TInstance;
    }

    const { scope = 'singleton', injects } = provider.schema;

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
        scopeId = params.requestId;
        requestId = params.requestId;
        break;
    }

    if (scopeId) {
      instance = await this.getProvider<TInstance>(providerId, {
        scopeId,
      });

      if (instance !== undefined) {
        return instance as TInstance;
      }
    }

    const args = await this.resolveInjections(providerId, injects, {
      ...params,
      moduleId: providerModuleId,
      requestId,
    });

    if ('useClass' in provider.schema) {
      instance = new provider.schema.useClass(...args);
    } else if ('useFactory' in provider.schema) {
      instance = await provider.schema.useFactory(...args);
    }

    if (instance === undefined) {
      return;
    }

    const onInit = this.createProviderHandler(providerId, instance, OnInit);
    const onResolve = this.createProviderHandler(providerId, instance, OnResolve);
    const onDestroy = this.createProviderHandler(providerId, instance, OnDestroy);

    if (onInit) {
      await onInit();
    } else if (onResolve) {
      await onResolve();
    }

    if (scopeId) {
      this.setProvider(providerId, instance, {
        scopeId,
        onResolve,
        onDestroy,
      });
    }

    return instance as TInstance;
  }

  async resolveProviderGroup(
    providerGroup: ProviderGroup,
    params: ResolveProviderParams = {},
  ): Promise<unknown[]> {
    const result: unknown[] = [];

    for (const { providerId, moduleId } of this.compiler.locateProviders(providerGroup)) {
      result.push(await this.resolveProvider(providerId, { ...params, moduleId }));
    }

    return result;
  }

  createProviderHandler(
    providerId: ProviderId,
    instance: unknown,
    handlerDecorator: Fn,
  ): ProviderHandlerFn | undefined {
    if (!isObject<CallableInstance<MaybePromise>>(instance)) {
      return;
    }

    const provider = this.compiler.getProvider(providerId, true);

    const handlerMetadata = getClassMetadata<unknown, ProviderHandlerSchema>(
      instance,
    )?.handlers?.get(handlerDecorator);

    if (!handlerMetadata) {
      return;
    }

    const { moduleId } = provider;
    const {
      propKey,
      options: { injects, disposable },
    } = handlerMetadata;

    return async () => {
      if (instance[propKey]) {
        const args = await this.resolveInjections(providerId, injects, {
          moduleId,
        });

        await instance[propKey](...args);
      }

      if (disposable) {
        instance[propKey] = () => {
          return RuntimeException.throw`Provider ${providerId} handler @${handlerDecorator} was called more than once`;
        };
      }
    };
  }

  async resolveInjections(
    parentProviderId: ProviderId,
    injections: InjectionsLike | undefined,
    options: ResolveProviderParams = {},
  ): Promise<unknown[]> {
    const args: unknown[] = [];

    if (Array.isArray(injections)) {
      for (const [index, injectionDef] of injections.entries()) {
        args.push(
          await this.resolveInjection(
            `#${index}`,
            parentProviderId,
            injectionDef,
            options,
          ),
        );
      }
    } else if (isObject(injections)) {
      const arg: RawObject = {};

      for (const [key, injectionDef] of Object.entries(injections)) {
        arg[key] = await this.resolveInjection(
          `.${key}`,
          parentProviderId,
          injectionDef,
          options,
        );
      }

      args.push(arg);
    }

    return args;
  }

  private async resolveInjection(
    pos: string,
    parentProviderId: ProviderId,
    injection: InjectionLike,
    params: ResolveProviderParams,
  ): Promise<unknown> {
    const { rootModuleId } = this.compiler;

    const {
      requestId,
      moduleId = rootModuleId,
      providerOptions,
      resolveInjection,
    } = params;

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

      case PARENT_PROVIDER_ID:
        return parentProviderId;
    }

    if (isString(injection, false)) {
      return injection;
    }

    let token: TokenLike | undefined;
    let optional = false;
    let options: unknown;

    if (isObject(injection)) {
      if ('useGroup' in injection) {
        return await this.resolveProviderGroup(injection.useGroup, params);
      }

      if ('useValue' in injection) {
        return injection.useValue;
      }

      if ('options' in injection) {
        options = injection.options;
      }

      if ('useBuilder' in injection) {
        return injection.useBuilder(options);
      }

      if ('optional' in injection) {
        optional = !!injection.optional;
      }

      if ('useToken' in injection) {
        token = injection.useToken;
      }
    }

    token ??= injection;

    if (resolveInjection) {
      const resolved = await resolveInjection(token, options);

      if (resolved !== undefined) {
        return resolved;
      }
    }

    const value = await this.resolveProvider(
      Id.for(token),
      {
        ...params,
        moduleId,
        providerOptions: options ?? providerOptions,
      },
      false,
    );

    if (value === undefined && !optional) {
      return RuntimeException.throw`Cannot inject ${injection} into ${parentProviderId} (position: ${pos})`;
    }

    return value ?? null;
  }
}
