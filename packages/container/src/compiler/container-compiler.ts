import type { Class } from '@bunito/common';
import { isClass, isFn, isObject } from '@bunito/common';
import { ContainerException } from '../container.exception';
import type { ProviderMetadata } from '../decorators';
import {
  getComponentMetadata,
  getModuleMetadata,
  getProviderMetadata,
  OnDestroy,
  OnInit,
  OnResolve,
} from '../decorators';
import type { TokenLike } from '../utils';
import { Id } from '../utils';
import type {
  ComponentDefinition,
  ComponentId,
  ComponentKey,
  MatchedComponents,
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

  private readonly components = new Map<ComponentId, ComponentDefinition>();

  constructor(moduleLike: ModuleLike) {
    [this.rootModuleId] = this.compileModule(moduleLike);
  }

  getModule(moduleId: ModuleId, orThrow?: true): ModuleNode;
  getModule(moduleId: ModuleId, orThrow: boolean): ModuleNode | undefined;
  getModule(moduleId: ModuleId, orThrow = true): ModuleNode | undefined {
    const result = this.modules.get(moduleId);

    if (!result && orThrow) {
      return ContainerException.throw`Module ${moduleId} was not found`;
    }

    return result;
  }

  getProvider(providerId: ProviderId, orThrow?: true): ProviderDefinition;
  getProvider(providerId: ProviderId, orThrow: boolean): ProviderDefinition | undefined;
  getProvider(providerId: ProviderId, orThrow = true): ProviderDefinition | undefined {
    const result = this.providers.get(providerId);

    if (!result && orThrow) {
      return ContainerException.throw`Provider ${providerId} was not found`;
    }

    return result;
  }

  getComponent(componentId: ComponentId, orThrow?: true): ComponentDefinition;
  getComponent(
    componentId: ComponentId,
    orThrow: boolean,
  ): ComponentDefinition | undefined;
  getComponent(
    componentId: ComponentId,
    orThrow = true,
  ): ComponentDefinition | undefined {
    const result = this.components.get(componentId);

    if (!result && orThrow) {
      return ContainerException.throw`Component ${componentId} was not found`;
    }

    return result;
  }

  locateComponents(
    componentKey: ComponentKey,
    moduleId = this.rootModuleId,
  ): MatchedComponents | undefined {
    let result: MatchedComponents | undefined;

    const { children, components } = this.getModule(moduleId);

    if (components) {
      for (const componentId of components) {
        const component = this.getComponent(componentId);
        const options = component.options.get(componentKey);
        if (!options) {
          continue;
        }

        result ??= { moduleId };
        result.components ??= [];
        result.components.push(
          'useProvider' in component
            ? {
                useProvider: component.useProvider,
                options,
              }
            : {
                useClass: component.useClass,
                options,
              },
        );
      }
    }

    if (children) {
      for (const childId of children) {
        const child = this.locateComponents(componentKey, childId);
        if (!child) {
          continue;
        }

        result ??= { moduleId };
        result.children ??= [];
        result.children.push(child);
      }
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

  private compileModule(
    moduleLike: ModuleLike,
    parentId?: Id,
    parentStack = new Set<Id>(),
  ): [moduleId: Id, moduleNode: ModuleNode] {
    const moduleId = Id.for(moduleLike);

    if (parentStack.has(moduleId)) {
      return ContainerException.throw`Circular module dependency detected: ${[
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
      moduleOptions = getModuleMetadata(moduleLike);
    } else if (isObject<ModuleOptions>(moduleLike)) {
      moduleOptions = moduleLike;
    }

    if (!moduleOptions) {
      return ContainerException.throw`Missing @Module() metadata on ${moduleLike}`;
    }

    const {
      token: _,
      imports: moduleImports,
      exports: moduleExports,
      ...moduleProviders
    } = moduleOptions;

    const moduleProvidersLike = Object.values(moduleProviders).flat(1) as ProviderLike[];

    if (!moduleImports && !moduleExports && !moduleProvidersLike.length) {
      return ContainerException.throw`Module ${moduleLike} must declare imports, exports, or providers`;
    }

    moduleNode = {};

    const components: Set<ComponentId> = new Set();
    const componentsWithProvider: ComponentId[] = [];
    const componentsWithClass: ComponentId[] = [];

    if (parentId) {
      moduleNode.parents = new Set([parentId]);
    }

    this.modules.set(moduleId, moduleNode);

    if (moduleClass) {
      const [providerId] = this.compileProvider(moduleId, moduleClass);

      if (providerId) {
        moduleNode.providers ??= new Map();
        moduleNode.providers.set(providerId, moduleId);
      }

      const componentId = this.compileComponent(moduleClass, providerId);

      if (componentId) {
        components.add(componentId);
        if (providerId) {
          componentsWithProvider.push(componentId);
        } else {
          componentsWithClass.push(componentId);
        }
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
          return ContainerException.throw`Module ${importId} is already imported by module ${moduleId}`;
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
            return ContainerException.throw`Provider ${providerId} is already available in module ${moduleId}`;
          }

          moduleNode.providers.set(providerId, providerModuleId);

          providerNode.moduleIds?.add(moduleId);
        }
      }
    }

    for (const providerLike of moduleProvidersLike) {
      const [providerId, providerClass] = this.compileProvider(moduleId, providerLike);

      if (providerId) {
        moduleNode.providers ??= new Map();
        moduleNode.providers.set(providerId, moduleId);
      }

      let componentId: ComponentId | undefined;

      if (providerClass) {
        componentId = this.compileComponent(providerClass, providerId);

        if (componentId) {
          if (components.has(componentId)) {
            return ContainerException.throw`Component ${providerClass} is already registered in module ${moduleId}`;
          }

          components.add(componentId);

          if (providerId) {
            componentsWithProvider.push(componentId);
          } else {
            componentsWithClass.push(componentId);
          }
        }
      }

      if (!providerId && !componentId) {
        return ContainerException.throw`Provider ${providerLike} in module ${moduleId} is missing provider options`;
      }
    }

    if (moduleExports) {
      moduleNode.exports ??= new Set();

      for (const exportToken of moduleExports) {
        const exportId = Id.for(exportToken);
        const providerModuleId = moduleNode.providers?.get(exportId);

        if (providerModuleId) {
          if (moduleNode.exports.has(exportId)) {
            return ContainerException.throw`Provider ${exportId} is already exported from module ${moduleId}`;
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
              return ContainerException.throw`Provider ${providerId} from module ${exportId} is already exported from module ${moduleId}`;
            }

            moduleNode.exports.add(providerId);
          }

          continue;
        }

        return ContainerException.throw`Export ${exportId} was not found in module ${moduleId}`;
      }
    }

    if (components.size) {
      moduleNode.components = [...componentsWithClass, ...componentsWithProvider];
    }

    return [moduleId, moduleNode];
  }

  private compileProvider(
    moduleId: ModuleId,
    providerLike: ProviderLike,
  ): [providerId?: ProviderId, providerClass?: Class] {
    let providerClass: Class | undefined;
    let providerOptions: ProviderOptions | undefined;
    let providerMetadata: ProviderMetadata | undefined;

    if (isClass(providerLike)) {
      providerClass = providerLike;
      providerMetadata = getProviderMetadata(providerLike);

      if (providerMetadata) {
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
    }

    if (!providerOptions) {
      return [undefined, providerClass];
    }

    let token: TokenLike | undefined;

    if ('useClass' in providerOptions) {
      ({ token } = providerOptions);
      const { useClass } = providerOptions;

      token ??= useClass;
      providerMetadata ??= getProviderMetadata(providerOptions.useClass);
    } else if ('useFactory' in providerOptions) {
      ({ token } = providerOptions);
      const { useFactory } = providerOptions;

      token ??= useFactory;
    } else if ('useValue' in providerOptions) {
      ({ token } = providerOptions);
    }

    if (!token) {
      return [undefined, providerClass];
    }

    const providerId = Id.for(token);
    const providerDefinition = this.providers.get(providerId);

    if (providerDefinition) {
      return ContainerException.throw`Provider ${providerId} is already defined in module ${providerDefinition.moduleId}`;
    }

    const { global } = providerOptions;

    const handlers = providerMetadata?.handlers;

    this.providers.set(providerId, {
      moduleId: moduleId,
      moduleIds: global ? undefined : new Set([moduleId]),
      options: providerOptions,
      handlers,
    });

    if (providerMetadata?.decorator) {
      this.indexProvider(providerMetadata.decorator, providerId);
    }

    if (handlers) {
      for (const handlerKey of handlers.keys()) {
        this.indexProvider(handlerKey, providerId);
      }
    }

    return [providerId, providerClass];
  }

  private compileComponent(
    componentClass: Class,
    providerId?: ProviderId,
  ): ComponentId | undefined {
    const options = getComponentMetadata(componentClass);

    if (!options) {
      return;
    }

    const componentId = Id.for(componentClass);

    this.components.set(
      componentId,
      providerId
        ? {
            useProvider: providerId,
            options,
          }
        : {
            useClass: componentClass,
            options,
          },
    );

    return componentId;
  }

  private indexProvider(providerKey: ProviderKey, providerId: ProviderId): void {
    switch (providerKey) {
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
