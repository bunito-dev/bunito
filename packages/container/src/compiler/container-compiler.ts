import type { Class, Fn } from '@bunito/common';
import { InternalException, isClass, isFn, isObject } from '@bunito/common';
import type { ProviderMetadata } from '../decorators';
import {
  Controller,
  getClassMetadata,
  getControllerProps,
  Module,
  OnDestroy,
  OnInit,
  OnResolve,
  Provider,
} from '../decorators';
import type { TokenLike } from '../utils';
import { Id } from '../utils';
import type {
  MatchedControllers,
  ModuleId,
  ModuleLike,
  ModuleNode,
  ModuleOptions,
  ProviderDefinition,
  ProviderEntity,
  ProviderId,
  ProviderKey,
  ProviderLike,
  ProviderOptions,
} from './types';

export class ContainerCompiler {
  readonly rootModuleId: ModuleId;

  private readonly modules = new Map<ModuleId, ModuleNode>();

  private readonly providers = new Map<ProviderId, ProviderDefinition>();

  private readonly providerIds = new Map<ProviderKey, Set<ProviderId>>();

  constructor(moduleLike: ModuleLike) {
    [this.rootModuleId] = this.compileModule(moduleLike);
  }

  getModule(moduleId: ModuleId, orThrow?: true): ModuleNode;
  getModule(moduleId: ModuleId, orThrow: boolean): ModuleNode | undefined;
  getModule(moduleId: ModuleId, orThrow = true): ModuleNode | undefined {
    const result = this.modules.get(moduleId);

    if (!result && orThrow) {
      return InternalException.throw`Module ${moduleId} was not found`;
    }

    return result;
  }

  getProvider(providerId: ProviderId, orThrow?: true): ProviderDefinition;
  getProvider(providerId: ProviderId, orThrow: boolean): ProviderDefinition | undefined;
  getProvider(providerId: ProviderId, orThrow = true): ProviderDefinition | undefined {
    const result = this.providers.get(providerId);

    if (!result && orThrow) {
      return InternalException.throw`Provider ${providerId} was not found`;
    }

    return result;
  }

  getProviders(providerKey: ProviderKey): ProviderEntity[] | undefined {
    const providerIds = this.providerIds.get(providerKey);
    if (!providerIds) {
      return;
    }

    const result: ProviderEntity[] = [];

    for (const providerId of providerIds ?? []) {
      const moduleId = this.providers.get(providerId)?.moduleId;
      if (!moduleId) {
        continue;
      }

      result.push({
        moduleId,
        providerId,
      });
    }

    return result;
  }

  locateControllers(
    propsKey: symbol,
    moduleId = this.rootModuleId,
  ): MatchedControllers | undefined {
    let matched: MatchedControllers | undefined;

    const { classes, controllers, children } = this.getModule(moduleId);

    if (classes) {
      for (const classRef of classes) {
        const props = getControllerProps(classRef, propsKey);

        if (!props) {
          continue;
        }

        matched ??= { moduleId };
        matched.props ??= [];
        matched.props.push(...props);
      }
    }

    if (controllers) {
      for (const { classRef, providerId, options } of controllers) {
        const props = getControllerProps(classRef, propsKey);

        if (!props) {
          continue;
        }

        matched ??= { moduleId };
        matched.controllers ??= [];
        matched.controllers.push({
          providerId,
          options,
          props,
        });
      }
    }

    if (children) {
      for (const childModuleId of children) {
        const child = this.locateControllers(propsKey, childModuleId);

        if (!child) {
          continue;
        }

        matched ??= { moduleId };
        matched.children ??= [];
        matched.children.push(child);
      }
    }

    return matched;
  }

  private compileModule(
    moduleLike: ModuleLike,
    parentId?: Id,
    parentStack = new Set<Id>(),
  ): [moduleId: Id, moduleNode: ModuleNode] {
    const moduleId = Id.for(moduleLike);

    if (parentStack.has(moduleId)) {
      return InternalException.throw`Circular module dependency detected: ${[
        ...parentStack,
        moduleId,
      ]}`;
    }

    let moduleNode = this.modules.get(moduleId);

    if (moduleNode) {
      if (parentId) {
        moduleNode.parents ??= new Set();
        moduleNode.parents.add(parentId);
      }

      return [moduleId, moduleNode];
    }

    let moduleClass: Class | undefined;
    let moduleOptions: ModuleOptions | undefined;

    if (isClass(moduleLike)) {
      moduleClass = moduleLike;
      moduleOptions = getClassMetadata(moduleClass, 'module');
    } else if (isObject<ModuleOptions>(moduleLike)) {
      moduleOptions = moduleLike;
    }

    if (!moduleOptions) {
      return InternalException.throw`Missing @Module() metadata on ${moduleLike}`;
    }

    const {
      token: _,
      imports: moduleImports,
      exports: moduleExports,
      ...moduleProviders
    } = moduleOptions;

    const moduleProvidersLike = Object.values(moduleProviders).flat(1) as ProviderLike[];

    if (!moduleImports && !moduleExports && !moduleProvidersLike.length) {
      return InternalException.throw`Module ${moduleLike} must declare imports, exports, or providers`;
    }

    moduleNode = {};

    if (parentId) {
      moduleNode.parents = new Set([parentId]);
    }

    this.modules.set(moduleId, moduleNode);

    if (moduleClass) {
      const [providerId, , classRef] = this.compileProvider(moduleId, moduleClass);

      if (providerId) {
        moduleNode.providers ??= new Map();
        moduleNode.providers.set(providerId, moduleId);
      }

      if (classRef) {
        moduleNode.classes ??= [];
        moduleNode.classes.push(classRef);
      }
    }

    if (moduleImports) {
      const moduleStack = new Set(parentStack).add(moduleId);

      moduleNode.children ??= new Set();

      for (const importLike of moduleImports) {
        const [importId, importNode] = this.compileModule(
          importLike,
          moduleId,
          moduleStack,
        );

        if (moduleNode.children.has(importId)) {
          return InternalException.throw`Module ${importId} is already imported by module ${moduleId}`;
        }

        moduleNode.children.add(importId);

        if (!importNode.exports) {
          continue;
        }

        moduleNode.providers ??= new Map();

        for (const providerId of importNode.exports) {
          const providerNode = this.providers.get(providerId);
          const providerModuleId = importNode.providers?.get(providerId);

          if (!providerNode || !providerModuleId) {
            continue; // never happens
          }

          if (moduleNode.providers.has(providerId)) {
            return InternalException.throw`Provider ${providerId} is already available in module ${moduleId}`;
          }

          moduleNode.providers.set(providerId, providerModuleId);

          providerNode.moduleIds?.add(moduleId);
        }
      }
    }

    for (const providerLike of moduleProvidersLike) {
      const [providerId, providerDecorator, classRef] = this.compileProvider(
        moduleId,
        providerLike,
      );

      if (providerId) {
        moduleNode.providers ??= new Map();
        moduleNode.providers.set(providerId, moduleId);

        switch (providerDecorator) {
          case Module:
            return InternalException.throw`Module ${moduleId} cannot have providers decorated with @Module`;

          case Controller:
            if (classRef) {
              const options = getClassMetadata(classRef, 'controller');

              if (options) {
                moduleNode.controllers ??= [];
                moduleNode.controllers.push({
                  providerId,
                  classRef,
                  options,
                });
              }
            }
            break;

          default:
        }
      } else if (classRef) {
        moduleNode.classes ??= [];
        moduleNode.classes.push(classRef);
      } else {
        return InternalException.throw`Provider ${providerLike} in module ${moduleId} is missing provider options`;
      }
    }

    if (moduleExports) {
      moduleNode.exports ??= new Set();

      for (const exportToken of moduleExports) {
        const exportId = Id.for(exportToken);
        const providerModuleId = moduleNode.providers?.get(exportId);

        if (providerModuleId) {
          if (moduleNode.exports.has(exportId)) {
            return InternalException.throw`Provider ${exportId} is already exported from module ${moduleId}`;
          }

          moduleNode.exports.add(exportId);
          continue;
        }

        if (moduleNode.children?.has(exportId)) {
          const exportProviderIds = this.modules.get(exportId)?.exports;

          if (!exportProviderIds) {
            continue;
          }

          for (const providerId of exportProviderIds) {
            if (moduleNode.exports.has(providerId)) {
              return InternalException.throw`Provider ${providerId} from module ${exportId} is already exported from module ${moduleId}`;
            }

            moduleNode.exports.add(providerId);
          }

          continue;
        }

        return InternalException.throw`Export ${exportId} was not found in module ${moduleId}`;
      }
    }

    return [moduleId, moduleNode];
  }

  private compileProvider(
    moduleId: ModuleId,
    providerLike: ProviderLike,
  ): [providerId?: ProviderId, providerDecorator?: Fn, classRef?: Class] {
    let classRef: Class | undefined;
    let providerOptions: ProviderOptions | undefined;
    let providerMetadata: ProviderMetadata | undefined;

    if (isClass(providerLike)) {
      classRef = providerLike;
      providerMetadata = getClassMetadata(providerLike, 'provider');

      if (providerMetadata?.options || providerMetadata?.handlers) {
        providerOptions = {
          ...(providerMetadata.options ?? {}),
          useClass: providerLike,
        };
      }
    } else if (isFn(providerLike)) {
      providerOptions = {
        useFactory: providerLike,
      };
    } else if (isObject<ProviderOptions>(providerLike)) {
      providerOptions = providerLike;

      if ('useClass' in providerOptions) {
        classRef = providerOptions.useClass;
        providerMetadata = getClassMetadata(classRef, 'provider');
      }
    }

    if (classRef && !getClassMetadata(classRef, 'props')) {
      classRef = undefined;
    }

    let token: TokenLike | undefined;

    if (providerOptions) {
      if ('useClass' in providerOptions) {
        token = providerOptions.token ?? providerOptions.useClass;
      } else if ('useFactory' in providerOptions) {
        token = providerOptions.token ?? providerOptions.useFactory;
      } else if ('useValue' in providerOptions) {
        token = providerOptions.token;
      }
    }

    if (!providerOptions || !token) {
      return [undefined, undefined, classRef];
    }

    const providerId = Id.for(token);
    const providerDefinition = this.providers.get(providerId);

    if (providerDefinition) {
      return InternalException.throw`Provider ${providerId} is already defined in module ${providerDefinition.moduleId}`;
    }

    const { global } = providerOptions;

    const decorator = providerMetadata?.decorator;
    const handlers = providerMetadata?.handlers;

    this.providers.set(providerId, {
      moduleId: moduleId,
      moduleIds: global ? undefined : new Set([moduleId]),
      options: providerOptions,
      handlers,
    });

    if (decorator) {
      this.indexProvider(decorator, providerId);
    }

    if (handlers) {
      for (const handlerKey of handlers.keys()) {
        this.indexProvider(handlerKey, providerId);
      }
    }

    return [providerId, decorator, classRef];
  }

  private indexProvider(providerKey: ProviderKey, providerId: ProviderId): void {
    switch (providerKey) {
      case Provider:
      case Module:
      case Controller:
      case OnInit:
      case OnResolve:
      case OnDestroy:
        break;

      default:
        this.providerIds
          .getOrInsertComputed(providerKey, () => new Set())
          .add(providerId);
    }
  }
}
