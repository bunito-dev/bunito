import type { Class } from '@bunito/common';
import { ConfigurationException, isClass, isFn, isObject } from '@bunito/common';
import { getDecoratorMetadata } from './decorators';
import { Id } from './id';
import type {
  ComponentDefinition,
  ComponentKey,
  ExtensionDefinition,
  ExtensionKey,
  ModuleComponentDefinition,
  ModuleDefinition,
  ModuleId,
  ModuleOptions,
  ModuleOptionsLike,
  ProviderDefinition,
  ProviderEvents,
  ProviderId,
  ProviderOptions,
  ProviderOptionsLike,
  ProviderScope,
} from './types';
import { resolveInjections, resolveToken } from './utils';

export class ContainerCompiler {
  private readonly globalProviders = new Map<ProviderId, ModuleId>();

  private readonly modules = new Map<ModuleId, ModuleDefinition>();

  private readonly extensions = new Map<
    ExtensionKey,
    Map<ProviderId, ExtensionDefinition>
  >();

  readonly rootModuleId: ModuleId;

  constructor(rootModuleOptionsLike: ModuleOptionsLike) {
    const [moduleId] = this.compileModule(rootModuleOptionsLike);

    this.rootModuleId = moduleId;
  }

  getModule(moduleId: ModuleId): ModuleDefinition {
    const module = this.modules.get(moduleId);

    if (!module) {
      return ConfigurationException.throw`Module ${moduleId} not found`;
    }

    return module;
  }

  getProvider(
    providerId: ProviderId,
    moduleId: ModuleId,
  ): [providerModuleId?: ModuleId, definition?: ProviderDefinition] {
    const module = this.modules.get(this.globalProviders.get(providerId) ?? moduleId);

    if (!module) {
      return [];
    }

    const { providers } = module;

    const providerModuleId = providers.available.get(providerId);

    if (!providerModuleId) {
      return [];
    }

    const definition = this.modules
      .get(providerModuleId)
      ?.providers.definitions.get(providerId);

    return [providerModuleId, definition];
  }

  getExtensions(extensionKey: ExtensionKey): ExtensionDefinition[] {
    return [...(this.extensions.get(extensionKey)?.values() ?? [])];
  }

  getComponents(
    componentKey: ComponentKey,
    moduleId = this.rootModuleId,
  ): ComponentDefinition[] {
    const found: ComponentDefinition[] = [];

    this.findComponents(componentKey, moduleId, found);

    return found;
  }

  private findComponents(
    componentKey: ComponentKey,
    moduleId: ModuleId,
    found: ComponentDefinition[],
    parentOptions: unknown[] = [],
  ): void {
    const module = this.modules.get(moduleId);

    if (!module) {
      return;
    }

    const currentOptions = [
      ...parentOptions,
      ...(module.components.options?.get(componentKey) ?? []),
    ];

    const definitions = module.components.definitions?.get(componentKey) ?? [];

    for (const { options, ...definition } of definitions) {
      found.push({
        ...definition,
        moduleId,
        options: [...currentOptions, ...options],
      } as ComponentDefinition);
    }

    for (const childId of module.children) {
      this.findComponents(componentKey, childId, found, currentOptions);
    }
  }

  private compileModule(
    optionsLike: ModuleOptionsLike,
    parentId?: ModuleId,
    parentIds: Set<ModuleId> = new Set(),
  ): [ModuleId, ModuleDefinition] {
    const moduleId = Id.for(optionsLike);

    if (parentIds.has(moduleId)) {
      return ConfigurationException.throw`Circular dependency detected ${parentIds} in ${moduleId} module`;
    }

    let definition = this.modules.get(moduleId);

    if (definition) {
      if (parentId) {
        definition.parents.add(parentId);
      }

      return [moduleId, definition];
    }

    definition = {
      parents: new Set(parentId ? [parentId] : []),
      children: new Set(),
      providers: {
        available: new Map(),
        definitions: new Map(),
        exported: new Set(),
      },
      components: {
        definitions: new Map(),
      },
    };

    const { children, providers, components } = definition;

    this.modules.set(moduleId, definition);

    let options: ModuleOptions | undefined;

    if (isClass(optionsLike)) {
      options = getDecoratorMetadata(optionsLike, 'module');

      if (!options) {
        return ConfigurationException.throw`@Module() decorator is missing in ${moduleId} module`;
      }

      const [providerId, providerDefinition] = this.tryCompileProvider(
        moduleId,
        optionsLike,
      );

      if (providerId && providerDefinition) {
        providers.available.set(providerId, moduleId);
        providers.definitions.set(providerId, providerDefinition);
      }

      components.options = getDecoratorMetadata(optionsLike, 'classOptions');
    } else {
      options = optionsLike as ModuleOptions;
    }

    const {
      exports: exportsOption,
      imports: importsOption,
      ...providersGroups
    } = options;

    if (importsOption?.length) {
      const moduleIds = new Set([...parentIds, moduleId]);

      for (const importedOptionsLike of importsOption) {
        const [
          importedModuleId,
          {
            providers: { exported: importedProviderIds, available: importedModuleIds },
          },
        ] = this.compileModule(importedOptionsLike, moduleId, moduleIds);

        for (const importedProviderId of importedProviderIds) {
          const importedModuleId = importedModuleIds.get(importedProviderId);

          if (!importedModuleId) {
            continue;
          }

          providers.available.set(importedProviderId, importedModuleId);
        }

        children.add(importedModuleId);
      }
    }

    const providersOption = Object.values(providersGroups).flat(1);

    if (providersOption.length) {
      for (const providerOptionsLike of providersOption) {
        const [providerId, providerDefinition] = this.tryCompileProvider(
          moduleId,
          providerOptionsLike,
        );

        if (providerId && providerDefinition) {
          providers.definitions.set(providerId, providerDefinition);
          providers.available.set(providerId, moduleId);
        }

        if (isClass(providerOptionsLike)) {
          if (
            this.tryCompileClassToken(
              providerOptionsLike,
              components.definitions,
              moduleId,
              providerId,
            )
          ) {
            continue;
          }
        }

        if (!providerId) {
          return ConfigurationException.throw`Missing provider options for ${providerOptionsLike} in ${moduleId} module`;
        }
      }
    }

    if (exportsOption) {
      for (const exportedToken of exportsOption) {
        const exportedId = resolveToken(exportedToken);
        const exportedModuleId = providers.available.get(exportedId);

        if (exportedModuleId) {
          if (providers.exported.has(exportedId)) {
            return ConfigurationException.throw`Provider ${exportedId} is already exported in ${exportedModuleId} module`;
          }

          providers.exported.add(exportedId);
          continue;
        }

        if (children.has(exportedId)) {
          const exportedIds = this.modules.get(exportedId)?.providers.exported;

          if (exportedIds) {
            for (const providerId of exportedIds) {
              if (providers.exported.has(providerId)) {
                return ConfigurationException.throw`Provider ${providerId} is already exported in ${exportedId} module`;
              }

              providers.exported.add(providerId);
            }
          }

          continue;
        }

        return ConfigurationException.throw`Provider ${exportedId} not found in ${moduleId} module`;
      }
    }

    return [moduleId, definition];
  }

  private tryCompileProvider(
    moduleId: ModuleId,
    optionsLike: ProviderOptionsLike,
    defaultScope: ProviderScope = 'singleton',
  ): [providerId?: ProviderId, definition?: ProviderDefinition] {
    let options: ProviderOptions | undefined;
    let events: ProviderEvents | undefined;

    if (isClass(optionsLike)) {
      const decoratorOptions = getDecoratorMetadata(optionsLike, 'provider');

      if (!decoratorOptions) {
        return [];
      }

      options = {
        ...decoratorOptions.options,
        useClass: optionsLike,
      };

      events = decoratorOptions.events;
    } else if (isFn(optionsLike)) {
      options = {
        useFactory: optionsLike,
      };
    } else {
      options = optionsLike as ProviderOptions;
    }

    let providerId: ProviderId | undefined;
    let definition: ProviderDefinition | undefined;

    if (isObject(options)) {
      if ('useClass' in options) {
        const { injects = [], token = options.useClass, ...commonOptions } = options;
        providerId = Id.for(token);
        definition = {
          scope: defaultScope,
          injects: resolveInjections(injects),
          ...commonOptions,
          events,
        };
      } else if ('useFactory' in options) {
        const { injects = [], token = options.useFactory, ...commonOptions } = options;

        providerId = Id.for(token);
        definition = {
          scope: defaultScope,
          injects: resolveInjections(injects),
          ...commonOptions,
          events,
        };
      } else if ('useValue' in options) {
        const { injects = [], token, ...commonOptions } = options;

        providerId = Id.for(token);
        definition = {
          scope: null,
          injects: null,
          ...commonOptions,
          events,
        };
      }

      if (options.global && providerId) {
        this.globalProviders.set(providerId, moduleId);
      }
    }

    return [providerId, definition];
  }

  private tryCompileClassToken(
    classToken: Class,
    componentsDefinitions: Map<ComponentKey, ModuleComponentDefinition[]>,
    moduleId: ModuleId,
    providerId?: ProviderId,
  ): boolean {
    let result = false;

    if (providerId) {
      const extension = getDecoratorMetadata(classToken, 'extension');

      if (extension) {
        const { key, options } = extension;

        const extensions = this.extensions.getOrInsertComputed(key, () => new Map());

        if (!extensions.has(providerId)) {
          extensions.set(providerId, {
            providerId,
            moduleId,
            options,
          });
        }

        result = true;
      }
    }

    const components = getDecoratorMetadata(classToken, 'components');

    if (!components) {
      return result;
    }

    for (const [key, options] of components) {
      const classOptions =
        getDecoratorMetadata(classToken, 'classOptions')?.get(key) ?? [];

      const props = getDecoratorMetadata(classToken, 'classProps')?.get(key) ?? [];

      const definition: Partial<ComponentDefinition> = providerId
        ? { useProviderId: providerId }
        : { useClass: classToken };

      componentsDefinitions
        .getOrInsertComputed(key, () => [])
        .push({
          ...definition,
          options: options ? [options, ...classOptions] : classOptions,
          props,
        });
    }

    return true;
  }
}
