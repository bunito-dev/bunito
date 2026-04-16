import type { Class } from '@bunito/common';
import {
  ConfigurationException,
  getDecoratorMetadata,
  isClass,
  isFn,
  isObject,
  str,
} from '@bunito/common';
import { DECORATOR_METADATA_KEYS } from './constants';
import { Id } from './id';
import type {
  ComponentDefinition,
  ComponentKey,
  ComponentPartialDefinition,
  ComponentProp,
  ExtensionDefinition,
  ExtensionKey,
  ModuleDefinition,
  ModuleId,
  ModuleOptions,
  ModuleOptionsLike,
  ProviderDecoratorOptions,
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
      throw new ConfigurationException(str`Module ${moduleId} not found`, {
        moduleId,
      });
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
        parentModuleIds: module.parents,
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
      const parentPath = [...parentIds].map((parentId) => str`${parentId}`).join(' → ');

      throw new ConfigurationException(
        str`Circular dependency detected ${parentPath} in ${moduleId} module`,
        {
          moduleId,
          parentIds,
        },
      );
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
      options = getDecoratorMetadata(optionsLike, DECORATOR_METADATA_KEYS.MODULE_OPTIONS);

      if (!options) {
        throw new ConfigurationException(
          str`@Module() decorator is missing in ${moduleId} module`,
          {
            moduleId,
            moduleOptions: options,
          },
        );
      }

      const [providerId, providerDefinition] = this.tryCompileProvider(
        moduleId,
        optionsLike,
      );

      if (providerId && providerDefinition) {
        providers.available.set(providerId, moduleId);
        providers.definitions.set(providerId, providerDefinition);
      }

      components.options = getDecoratorMetadata<Map<ComponentKey, unknown[]>>(
        optionsLike,
        DECORATOR_METADATA_KEYS.COMPONENT_OPTIONS,
      );
    } else {
      options = optionsLike as ModuleOptions;
    }

    const { exports: exportsOption, uses: usesOptions, imports: importsOption } = options;

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

    if (usesOptions) {
      for (const providerOptionsLike of usesOptions) {
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
          throw new ConfigurationException(
            str`Missing provider options for ${providerOptionsLike} in ${moduleId} module`,
            {
              moduleId,
              providerOptions: providerOptionsLike,
            },
          );
        }
      }
    }

    if (exportsOption) {
      for (const exportedToken of exportsOption) {
        const exportedId = resolveToken(exportedToken);
        const exportedModuleId = providers.available.get(exportedId);

        if (exportedModuleId) {
          if (providers.exported.has(exportedId)) {
            throw new ConfigurationException(
              `Provider ${exportedId} is already exported in ${exportedModuleId} module`,
              {
                moduleId,
                providerId: exportedId,
                providerModuleId: exportedModuleId,
              },
            );
          }

          providers.exported.add(exportedId);
          continue;
        }

        if (children.has(exportedId)) {
          const exportedIds = this.modules.get(exportedId)?.providers.exported;

          if (exportedIds) {
            for (const providerId of exportedIds) {
              if (providers.exported.has(providerId)) {
                throw new ConfigurationException(
                  `Provider ${providerId} is already exported in ${exportedId} module`,
                  {
                    moduleId,
                    providerId,
                    providerModuleId: exportedId,
                  },
                );
              }

              providers.exported.add(providerId);
            }
          }

          continue;
        }

        throw new ConfigurationException(
          str`Provider ${exportedId} not found in ${moduleId} module`,
          {
            moduleId,
            providerId: exportedId,
          },
        );
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

    if (isClass(optionsLike)) {
      const decoratorOptions = getDecoratorMetadata<ProviderDecoratorOptions>(
        optionsLike,
        DECORATOR_METADATA_KEYS.PROVIDER_OPTIONS,
      );

      if (!decoratorOptions) {
        return [];
      }

      options = {
        ...decoratorOptions,
        useClass: optionsLike,
      };
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
          events: getDecoratorMetadata<ProviderEvents>(
            options.useClass,
            DECORATOR_METADATA_KEYS.PROVIDER_EVENTS,
          ),
          ...commonOptions,
        };
      } else if ('useFactory' in options) {
        const { injects = [], token = options.useFactory, ...commonOptions } = options;

        providerId = Id.for(token);
        definition = {
          scope: defaultScope,
          injects: resolveInjections(injects),
          ...commonOptions,
        };
      } else if ('useValue' in options) {
        const { injects = [], token, ...commonOptions } = options;

        providerId = Id.for(token);
        definition = {
          scope: null,
          injects: null,
          ...commonOptions,
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
    componentsDefinitions: Map<ComponentKey, ComponentPartialDefinition[]>,
    moduleId: ModuleId,
    providerId?: ProviderId,
  ): boolean {
    if (providerId) {
      const extensionKey = getDecoratorMetadata<ExtensionKey>(
        classToken,
        DECORATOR_METADATA_KEYS.EXTENSION_KEY,
      );

      if (extensionKey) {
        const extensions = this.extensions.getOrInsertComputed(
          extensionKey,
          () => new Map(),
        );

        if (!extensions.has(providerId)) {
          extensions.set(providerId, {
            providerId,
            moduleId,
            options: getDecoratorMetadata(
              classToken,
              DECORATOR_METADATA_KEYS.EXTENSION_OPTIONS,
            ),
          });
        }

        return true;
      }
    }

    const componentKeys = getDecoratorMetadata<Set<ComponentKey>>(
      classToken,
      DECORATOR_METADATA_KEYS.COMPONENT_KEYS,
    );

    if (!componentKeys) {
      return false;
    }

    const options = getDecoratorMetadata<Map<ComponentKey, unknown[]>>(
      classToken,
      DECORATOR_METADATA_KEYS.COMPONENT_OPTIONS,
    );

    const fields = getDecoratorMetadata<Map<ComponentKey, ComponentProp[]>>(
      classToken,
      DECORATOR_METADATA_KEYS.COMPONENT_FIELDS,
    );

    const methods = getDecoratorMetadata<Map<ComponentKey, ComponentProp[]>>(
      classToken,
      DECORATOR_METADATA_KEYS.COMPONENT_METHODS,
    );

    const commonDefinition: Partial<ComponentDefinition> = providerId
      ? {
          useProviderId: providerId,
        }
      : {
          useClass: classToken,
        };

    for (const componentKey of componentKeys) {
      componentsDefinitions
        .getOrInsertComputed(componentKey, () => [])
        .push({
          ...commonDefinition,
          options: options?.get(componentKey) ?? [],
          fields: fields?.get(componentKey) ?? [],
          methods: methods?.get(componentKey) ?? [],
        });
    }

    return true;
  }
}
