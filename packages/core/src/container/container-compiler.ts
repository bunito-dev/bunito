import type { Class } from '@bunito/common';
import {
  getDecoratorMetadata,
  isClass,
  isFn,
  isObject,
  notEmpty,
  str,
} from '@bunito/common';
import { ConfigurationException, RuntimeException } from '../exceptions';
import { CONTAINER_METADATA_KEYS, DEFAULT_SCOPES } from './constants';
import { Id } from './id';
import type {
  ClassProviderMetadata,
  CompiledInjection,
  CompiledModule,
  CompiledProvider,
  ControllerRef,
  InjectionLike,
  LifecycleProps,
  ModuleDefinition,
  ModuleId,
  ModuleLike,
  ModuleOptions,
  ProviderId,
  ProviderLike,
  ProviderMatch,
  ProviderOptions,
} from './types';
import { resolveModuleId, resolveProviderId } from './utils';

export class ContainerCompiler {
  private readonly modules = new Map<ModuleId, CompiledModule>();

  // biome-ignore lint/complexity/noUselessConstructor: Coverage
  constructor() {}

  getModule(moduleId: ModuleId): CompiledModule {
    const module = this.modules.get(moduleId);

    if (!module) {
      throw new RuntimeException(str`Module ${moduleId} not found`, {
        moduleId,
      });
    }

    return module;
  }

  locateProvider(providerId: ProviderId, moduleId: ModuleId): ProviderMatch | undefined {
    const module = this.modules.get(moduleId);

    if (!module) {
      return;
    }

    const { providers, imports } = module;

    const provider = providers.get(providerId);

    if (provider) {
      return {
        moduleId,
        provider,
      };
    }

    for (const importedModuleId of imports) {
      const providerModuleId = this.modules
        .get(importedModuleId)
        ?.exports.get(providerId);

      if (providerModuleId) {
        const provider = this.modules.get(providerModuleId)?.providers.get(providerId);

        if (!provider) {
          continue;
        }

        return {
          moduleId: importedModuleId,
          provider,
        };
      }
    }
  }

  compileModule(
    moduleLike: ModuleLike,
    parentModuleIds: Set<ModuleId> = new Set(),
  ): ModuleId {
    const moduleId = resolveModuleId(moduleLike);

    if (parentModuleIds.has(moduleId)) {
      const parentPathParts: string[] = [];

      for (const parentModuleId of parentModuleIds) {
        parentPathParts.push(str`${parentModuleId}`);
      }

      const parentPath = parentPathParts.join(' → ');

      throw new ConfigurationException(
        str`Circular dependency detected between ${parentPath} in ${moduleId} module`,
        {
          moduleId,
          parentModuleIds,
        },
      );
    }

    if (this.modules.has(moduleId)) {
      return moduleId;
    }

    const moduleIds = new Set([...parentModuleIds, moduleId]);
    const definition = this.resolveModuleDefinition(moduleLike);

    const compiled: CompiledModule = {
      useClass: definition.useClass,
      imports: new Set(),
      providers: new Map(),
      controllers: new Set(),
      exports: new Map(),
    };

    this.modules.set(moduleId, compiled);

    // imports

    for (const moduleLike of definition.imports) {
      compiled.imports.add(this.compileModule(moduleLike, moduleIds));
    }

    // controllers

    for (const controllerRef of definition.controllers) {
      this.verifyController(controllerRef);

      const compiledProvider = this.compileProvider(controllerRef);
      const controllerId = Id.for(controllerRef);

      compiled.controllers.add(controllerId);
      compiled.providers.set(controllerId, compiledProvider);
    }

    // providers

    for (const providerLike of definition.providers) {
      const compiledProvider = this.compileProvider(providerLike);

      compiled.providers.set(resolveProviderId(providerLike), compiledProvider);
    }

    // exports

    for (const providerToken of definition.exports) {
      const providerId = resolveProviderId(providerToken);

      if (compiled.providers.has(providerId)) {
        compiled.exports.set(providerId, moduleId);
        continue;
      }

      let exportModuleId: ProviderId | undefined;

      for (const importedModuleId of compiled.imports) {
        const providerModuleId = this.modules
          .get(importedModuleId)
          ?.exports.get(providerId);

        if (providerModuleId) {
          if (exportModuleId) {
            throw new ConfigurationException(
              str`Provider ${providerId} is exported by multiple modules`,
              {
                moduleId,
                providerId,
              },
            );
          }

          exportModuleId = importedModuleId;
        }
      }

      if (!exportModuleId) {
        throw new ConfigurationException(
          str`Provider ${providerId} not found in ${moduleId} module`,
          {
            moduleId,
            providerId,
          },
        );
      }

      compiled.exports.set(providerId, exportModuleId);
    }

    return moduleId;
  }

  private resolveModuleDefinition(moduleLike: ModuleLike): ModuleDefinition {
    let options: ModuleOptions | undefined;
    let useClass: Class | undefined;

    if (isClass(moduleLike)) {
      options = getDecoratorMetadata<ModuleOptions>(
        moduleLike,
        CONTAINER_METADATA_KEYS.MODULE,
      );

      if (!options) {
        throw new ConfigurationException(
          str`Missing module metadata for ${moduleLike} `,
          {
            moduleLike,
          },
        );
      }

      useClass = moduleLike;
    } else {
      options = moduleLike as ModuleOptions;
    }

    return {
      useClass,
      imports: options.imports?.filter(notEmpty) ?? [],
      controllers: options.controllers?.filter(notEmpty) ?? [],
      providers: options.providers?.filter(notEmpty) ?? [],
      exports: options.exports?.filter(notEmpty) ?? [],
    };
  }

  private verifyController(controllerRef: ControllerRef): void {
    if (!getDecoratorMetadata<true>(controllerRef, CONTAINER_METADATA_KEYS.CONTROLLER)) {
      throw new ConfigurationException(
        str`Missing controller metadata for ${controllerRef}`,
        {
          controllerRef,
        },
      );
    }
  }

  private compileProvider(providerLike: ProviderLike): CompiledProvider {
    let options: ProviderOptions | undefined;

    if (isClass(providerLike)) {
      const metadata = getDecoratorMetadata<ClassProviderMetadata>(
        providerLike,
        CONTAINER_METADATA_KEYS.PROVIDER,
      );

      if (!metadata) {
        throw new ConfigurationException(
          str`Missing provider metadata for ${providerLike} `,
          {
            providerLike,
          },
        );
      }

      options = {
        ...metadata,
        useClass: providerLike,
      };
    } else if (isFn(providerLike)) {
      options = {
        useFactory: providerLike,
      };
    } else {
      options = providerLike as ProviderOptions;
    }

    if ('useClass' in options) {
      return {
        kind: 'class',
        scope: options.scope ?? DEFAULT_SCOPES.PROVIDER,
        useClass: options.useClass,
        injects: this.compileInjections(options.injects),
        lifecycle: this.resolveLifecycleProps(options.useClass),
      };
    }

    if ('useFactory' in options) {
      return {
        kind: 'factory',
        scope: options.scope ?? DEFAULT_SCOPES.PROVIDER,
        useFactory: options.useFactory,
        injects: this.compileInjections(options.injects),
      };
    }

    return {
      kind: 'value',
      useValue: options.useValue,
    };
  }

  private compileInjections(
    injections: Array<InjectionLike | null> | undefined,
  ): CompiledInjection[] {
    if (!injections) {
      return [];
    }

    const compiledInjections: CompiledInjection[] = [];

    for (const injectionLike of injections) {
      if (!notEmpty(injectionLike)) {
        continue;
      }

      if (
        isObject(injectionLike) &&
        'token' in injectionLike &&
        !('useClass' in injectionLike) &&
        !('useFactory' in injectionLike) &&
        !('useValue' in injectionLike)
      ) {
        compiledInjections.push({
          providerId: Id.for(injectionLike.token),
          optional: injectionLike.optional ?? false,
        });

        continue;
      }

      compiledInjections.push({
        providerId: resolveProviderId(injectionLike),
        optional: false,
      });
    }

    return compiledInjections;
  }

  private resolveLifecycleProps(target: Class): LifecycleProps {
    return new Map(
      getDecoratorMetadata<LifecycleProps>(target, CONTAINER_METADATA_KEYS.ON_LIFECYCLE),
    );
  }
}
