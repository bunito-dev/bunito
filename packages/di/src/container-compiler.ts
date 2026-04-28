import type { Class, Fn } from '@bunito/common';
import { ConfigurationException, isClass, isFn, isObject } from '@bunito/common';
import type { ProviderDecoratorOptions } from './decorators';
import { getClassDecoratorMetadata, Module, Provider } from './decorators';
import { Id } from './id';
import type {
  ComponentMatch,
  ModuleId,
  ModuleLike,
  ModuleNode,
  ModuleSchema,
  ProviderGroup,
  ProviderHandlerSchema,
  ProviderHandlers,
  ProviderId,
  ProviderLike,
  ProviderMatch,
  ProviderNode,
  ProviderSchema,
  TokenLike,
} from './types';

export class ContainerCompiler {
  readonly rootModuleId: Id;

  private readonly modules = new Map<ModuleId, ModuleNode>();

  private readonly providers = new Map<ProviderId, ProviderNode>();

  private readonly providerIds = new Map<ProviderGroup | Fn, Set<ProviderId>>();

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

  getProvider(providerId: ProviderId, orThrow?: true): ProviderNode;
  getProvider(providerId: ProviderId, orThrow: boolean): ProviderNode | undefined;
  getProvider(providerId: ProviderId, orThrow = true): ProviderNode | undefined {
    const provider = this.providers.get(providerId);

    if (!provider && orThrow) {
      return ConfigurationException.throw`Provider ${providerId} was not found`;
    }

    return provider;
  }

  locateComponents(
    decorator: Fn,
    moduleId = this.rootModuleId,
  ): ComponentMatch | undefined {
    const module = this.modules.get(moduleId);

    const result: ComponentMatch = {
      moduleId,
    };

    if (module?.providers) {
      for (const [useProvider, providerModuleId] of module.providers) {
        if (providerModuleId !== moduleId) {
          continue;
        }

        const provider = this.providers.get(useProvider);

        if (!provider) {
          continue;
        }

        if (!('useClass' in provider.schema)) {
          continue;
        }

        const metadata = getClassDecoratorMetadata(provider.schema.useClass, decorator);

        if (!metadata) {
          continue;
        }

        result.classes ??= [];
        result.classes.push({
          useProvider,
          metadata,
        });
      }
    }

    if (module?.classes) {
      for (const useClass of module.classes) {
        const metadata = getClassDecoratorMetadata(useClass, decorator);

        if (!metadata) {
          continue;
        }

        result.classes ??= [];
        result.classes.push({
          useClass,
          metadata,
        });
      }
    }

    if (module?.children) {
      for (const childId of module.children) {
        const child = this.locateComponents(decorator, childId);

        if (child) {
          result.children ??= [];
          result.children.push(child);
        }
      }
    }

    return result.classes || result.children ? result : undefined;
  }

  locateProviders(decoratorOrGroup: ProviderGroup | Fn): ProviderMatch[] {
    const result: ProviderMatch[] = [];

    const providerIds = this.providerIds.get(decoratorOrGroup);

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
      moduleSchema = getClassDecoratorMetadata<{
        class: ModuleSchema;
      }>(moduleLike, Module)?.options;
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
      } else {
        moduleNode.classes ??= new Set();
        moduleNode.classes.add(moduleClass);
      }
    }

    if (moduleSchema.imports) {
      const moduleStack = new Set(parentStack).add(moduleId);

      moduleNode.children ??= new Set();

      for (const importLike of moduleSchema.imports) {
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

    if (moduleSchema.providers) {
      for (const providerLike of moduleSchema.providers) {
        const [providerId, providerClass] = this.compileProvider(moduleId, providerLike);

        if (providerId) {
          moduleNode.providers ??= new Map();
          moduleNode.providers.set(providerId, moduleId);
          continue;
        }

        if (!providerClass) {
          return ConfigurationException.throw`Provider options are missing for ${providerLike} in ${moduleId} module`;
        }

        if (moduleNode.classes?.has(providerClass)) {
          return ConfigurationException.throw`${providerClass} is already defined in ${moduleId} module`;
        }

        moduleNode.classes ??= new Set();
        moduleNode.classes.add(providerClass);
      }
    }

    if (moduleSchema.exports) {
      moduleNode.exports ??= new Set();

      for (const exportToken of moduleSchema.exports) {
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
    let providerHandlers: ProviderHandlers | undefined;

    if (isClass(providerLike)) {
      const providerMetadata = getClassDecoratorMetadata<{
        class: ProviderDecoratorOptions;
        handler: ProviderHandlerSchema;
      }>(providerLike, Provider);

      providerClass = providerLike;

      if (providerMetadata?.options) {
        providerSchema = {
          ...providerMetadata.options,
          useClass: providerLike,
        };
      }
      providerHandlers = providerMetadata?.handlers;
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
      ({ token = providerSchema.useClass } = providerSchema);
    } else if ('useFactory' in providerSchema) {
      ({ token = providerSchema.useFactory } = providerSchema);
    } else if ('useValue' in providerSchema) {
      ({ token } = providerSchema);
    }

    if (!token) {
      return [undefined, providerClass];
    }

    const providerId = Id.for(token);
    const providerNode = this.providers.get(providerId);

    if (providerNode) {
      return ConfigurationException.throw`${providerId} is already defined in ${providerNode.moduleId} module`;
    }

    const { global, group } = providerSchema;

    this.providers.set(providerId, {
      moduleId: moduleId,
      moduleIds: global ? undefined : new Set([moduleId]),
      schema: providerSchema,
      handlers: providerHandlers,
    });

    if (group) {
      this.providerIds.getOrInsertComputed(group, () => new Set()).add(providerId);
    }

    if (providerHandlers) {
      for (const handlerKey of providerHandlers.keys()) {
        this.providerIds.getOrInsertComputed(handlerKey, () => new Set()).add(providerId);
      }
    }

    return [providerId];
  }
}
