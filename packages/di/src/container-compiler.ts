import type { Class } from '@bunito/common';
import {
  ConfigurationException,
  isClass,
  isFn,
  isObject,
  isSymbol,
} from '@bunito/common';
import type {
  ProviderDecoratorOptions,
  ProviderHandlerDecoratorOptions,
} from './decorators';
import { Module, Provider } from './decorators';
import { Id } from './id';
import type { ClassMetadata } from './metadata';
import { getClassMetadata } from './metadata';
import type {
  ComponentGroup,
  ComponentId,
  ComponentKey,
  ComponentMatch,
  ModuleId,
  ModuleLike,
  ModuleNode,
  ModuleSchema,
  ProviderDefinition,
  ProviderId,
  ProviderKey,
  ProviderLike,
  ProviderMatch,
  ProviderSchema,
  TokenLike,
} from './types';

export class ContainerCompiler {
  readonly rootModuleId: Id;

  private readonly modules = new Map<ModuleId, ModuleNode>();

  private readonly providers = new Map<ProviderId, ProviderDefinition>();

  private readonly components = new Map<ComponentId, ComponentGroup>();

  private readonly providerIds = new Map<ProviderKey, Set<ProviderId>>();

  constructor(moduleLike: ModuleLike) {
    [this.rootModuleId] = this.compileModule(moduleLike);
  }

  getModule(moduleId: ModuleId, orThrow?: true): ModuleNode;
  getModule(moduleId: ModuleId, orThrow: boolean): ModuleNode | undefined;
  getModule(moduleId: ModuleId, orThrow = true): ModuleNode | undefined {
    const module = this.modules.get(moduleId);

    if (!module && orThrow) {
      return ConfigurationException.throw`Module ${moduleId} was not found`;
    }

    return module;
  }

  getProvider(providerId: ProviderId, orThrow?: true): ProviderDefinition;
  getProvider(providerId: ProviderId, orThrow: boolean): ProviderDefinition | undefined;
  getProvider(providerId: ProviderId, orThrow = true): ProviderDefinition | undefined {
    const provider = this.providers.get(providerId);

    if (!provider && orThrow) {
      return ConfigurationException.throw`Provider ${providerId} was not found`;
    }

    return provider;
  }

  locateComponents(
    componentKey: ComponentKey,
    moduleId = this.rootModuleId,
  ): ComponentMatch | undefined {
    let result: ComponentMatch | undefined;

    const module = this.getModule(moduleId);

    if (module.components) {
      for (const componentId of module.components) {
        const component = this.components.get(componentId);

        if (!component) {
          continue;
        }

        const props = component.props.get(componentKey);

        if (props) {
          result ??= { moduleId };
          result.components ??= [];

          if ('useProvider' in component) {
            result.components.push({
              useProvider: component.useProvider,
              props,
            });
          } else if ('useClass' in component) {
            result.components.push({
              useClass: component.useClass,
              props,
            });
          }
        }
      }
    }

    if (module.children) {
      for (const childId of module.children) {
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

  locateProviders(providerKey: ProviderKey): ProviderMatch[] {
    const result: ProviderMatch[] = [];

    const providerIds = this.providerIds.get(providerKey);

    if (providerIds) {
      for (const providerId of providerIds) {
        const moduleId = this.providers.get(providerId)?.moduleId;

        if (!moduleId) {
          continue;
        }

        result.push({
          providerId,
          moduleId,
        });
      }
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
      return ConfigurationException.throw`Circular module dependency detected: ${[
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
    let moduleSchema: ModuleSchema | undefined;

    if (isClass(moduleLike)) {
      moduleClass = moduleLike;
      moduleSchema = getClassMetadata<ModuleSchema>(moduleLike)?.options?.get(Module);
    } else if (isObject<ModuleSchema>(moduleLike)) {
      moduleSchema = moduleLike;
    }

    if (!moduleSchema) {
      return ConfigurationException.throw`@Module() decorator is missing on ${moduleId}`;
    }

    moduleNode = {};

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
        moduleNode.components ??= new Set();
        moduleNode.components.add(componentId);
      }
    }

    const {
      token: _,
      imports: moduleImports,
      exports: moduleExports,
      ...moduleProviders
    } = moduleSchema;

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
          return ConfigurationException.throw`${importId} is already imported by ${moduleId} module`;
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
            return ConfigurationException.throw`${providerId} does not belong to ${moduleId} module`;
          }

          moduleNode.providers.set(providerId, providerModuleId);

          providerNode.moduleIds?.add(moduleId);
        }
      }
    }

    const moduleProvidersLike = Object.values(moduleProviders).flat(1) as ProviderLike[];

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
          if (moduleNode.components?.has(componentId)) {
            return ConfigurationException.throw`${providerClass} is already defined in ${moduleId} module`;
          }

          moduleNode.components ??= new Set();
          moduleNode.components.add(componentId);
        }
      }

      if (!providerId && !componentId) {
        return ConfigurationException.throw`Provider options are missing for ${providerLike} in ${moduleId} module`;
      }
    }

    if (moduleExports) {
      moduleNode.exports ??= new Set();

      for (const exportToken of moduleExports) {
        const exportId = Id.for(exportToken);
        const providerModuleId = moduleNode.providers?.get(exportId);

        if (providerModuleId) {
          if (moduleNode.exports.has(exportId)) {
            return ConfigurationException.throw`${exportId} is already exported from ${moduleId} module`;
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
              return ConfigurationException.throw`${providerId} from ${exportId} module is already exported from ${moduleId} module`;
            }

            moduleNode.exports.add(providerId);
          }

          continue;
        }

        return ConfigurationException.throw`${exportId} was not found in ${moduleId} module`;
      }
    }

    return [moduleId, moduleNode];
  }

  private compileProvider(
    moduleId: ModuleId,
    providerLike: ProviderLike,
  ): [providerId?: ProviderId, providerClass?: Class] {
    let providerClass: Class | undefined;
    let providerSchema: ProviderSchema | undefined;

    let classMetadata:
      | ClassMetadata<ProviderDecoratorOptions, ProviderHandlerDecoratorOptions>
      | undefined;

    if (isClass(providerLike)) {
      classMetadata = getClassMetadata(providerLike);

      providerClass = providerLike;

      const decoratorOptions = classMetadata?.options?.get(Provider);

      if (decoratorOptions) {
        providerSchema = {
          ...decoratorOptions,
          useClass: providerLike,
        };
      }
    } else if (isFn(providerLike)) {
      providerSchema = {
        useFactory: providerLike,
      };
    } else if (isObject<ProviderSchema>(providerLike)) {
      providerSchema = providerLike;
    }

    if (!providerSchema) {
      return [undefined, providerClass];
    }

    let token: TokenLike | undefined;

    if ('useClass' in providerSchema) {
      const { useClass } = providerSchema;
      token = useClass;
      providerClass ??= useClass;
    } else if ('useFactory' in providerSchema) {
      ({ token = providerSchema.useFactory } = providerSchema);
    } else if ('useValue' in providerSchema) {
      ({ token } = providerSchema);
    }

    if (!token) {
      return [undefined, providerClass];
    }

    const providerId = Id.for(token);
    const providerDefinition = this.providers.get(providerId);

    if (providerDefinition) {
      return ConfigurationException.throw`${providerId} is already defined in ${providerDefinition.moduleId} module`;
    }

    const { global, group } = providerSchema;

    this.providers.set(providerId, {
      moduleId: moduleId,
      moduleIds: global ? undefined : new Set([moduleId]),
      schema: providerSchema,
    });

    if (isSymbol(group)) {
      this.attachProviderId(providerId, group);
    } else if (Array.isArray(group)) {
      this.attachProviderId(providerId, ...group);
    }

    const handlerKeys = classMetadata?.handlers?.keys().toArray();

    if (handlerKeys) {
      this.attachProviderId(providerId, ...handlerKeys);
    }

    return [providerId, providerClass];
  }

  private compileComponent(
    componentClass: Class,
    providerId?: ProviderId,
  ): ComponentId | undefined {
    const props = getClassMetadata(componentClass)?.props;

    if (!props) {
      return;
    }

    const componentId = Id.for(componentClass);

    this.components.set(
      componentId,
      providerId
        ? {
            useProvider: providerId,
            props,
          }
        : {
            useClass: componentClass,
            props,
          },
    );

    if (providerId) {
      this.attachProviderId(providerId, ...props.keys().toArray());
    }

    return componentId;
  }

  private attachProviderId(providerId: ProviderId, ...keys: ProviderKey[]): void {
    for (const key of keys) {
      this.providerIds.getOrInsertComputed(key, () => new Set()).add(providerId);
    }
  }
}
