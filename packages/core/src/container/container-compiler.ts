import type { Class, Fn } from '@bunito/common';
import {
  getDecoratorMetadata,
  isClass,
  isFn,
  isObject,
  notEmpty,
  resolveName,
} from '@bunito/common';
import {
  DEFAULT_PROVIDER_SCOPE,
  MODULE_METADATA_KEY,
  PROVIDER_METADATA_KEY,
} from './constants';
import { ContainerCompilerException } from './container-compiler.exception';
import { Id } from './id';
import type {
  AnyProviderOptions,
  CompiledModule,
  ModuleId,
  ModuleOptions,
  ModuleOptionsNormalized,
  ModuleRef,
  ProviderId,
  ProviderInjection,
  ProviderInjectionOptions,
  ProviderMatch,
  ProviderOptionsNormalized,
  ProviderRef,
  Token,
} from './types';

export class ContainerCompiler {
  private readonly modules = new Map<ModuleId, CompiledModule>();

  // biome-ignore lint/complexity/noUselessConstructor: Explicit constructor keeps Bun function coverage accurate
  constructor() {
    //
  }

  getModule(moduleId: ModuleId): CompiledModule {
    const module = this.modules.get(moduleId);

    if (!module) {
      throw new ContainerCompilerException(`Module ${moduleId} not found`);
    }

    return module;
  }

  tryLocateProvider(
    providerId: ProviderId,
    moduleId: ModuleId,
  ): ProviderMatch | undefined {
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

  compileModule(moduleRef: ModuleRef, parentStack: Set<ModuleId> = new Set()): ModuleId {
    const moduleId = Id.for(moduleRef);

    if (parentStack.has(moduleId)) {
      throw new ContainerCompilerException(
        `Circular dependency detected between modules ${[...parentStack, moduleId].join(' -> ')}`,
      );
    }

    if (this.modules.has(moduleId)) {
      return moduleId;
    }

    const moduleStack = new Set([...parentStack, moduleId]);

    const options = this.tryResolveModuleOptions(moduleRef);

    if (!options) {
      throw new ContainerCompilerException(`Missing module ${moduleId} metadata`);
    }

    const compiled: CompiledModule = {
      entrypointId: undefined,
      imports: new Set(),
      providers: new Map(),
      controllers: new Set(),
      exports: new Map(),
    };

    this.modules.set(moduleId, compiled);

    // entrypoint

    if (options.entrypointRef) {
      const entrypointOptions = this.tryResolveProviderOptions(options.entrypointRef);

      if (!entrypointOptions) {
        throw new ContainerCompilerException(
          `Missing module ${moduleId} entrypoint metadata`,
        );
      }

      const { token, ...providerCompiled } = entrypointOptions;

      const entrypointId = Id.for(token);

      compiled.entrypointId = entrypointId;
      compiled.providers.set(entrypointId, providerCompiled);
    }

    // imports

    for (const moduleRef of options.imports) {
      compiled.imports.add(this.compileModule(moduleRef, moduleStack));
    }

    // controllers

    for (const controllerRef of options.controllers) {
      const providerOptions = this.tryResolveProviderOptions(controllerRef);

      if (!providerOptions) {
        throw new ContainerCompilerException(
          `Missing module ${moduleId} controller ${resolveName(controllerRef)} metadata`,
        );
      }

      const { token, ...providerCompiled } = providerOptions;

      const controllerId = Id.for(token);

      compiled.controllers.add(controllerId);
      compiled.providers.set(controllerId, providerCompiled);
    }

    // providers

    for (const providerRef of options.providers) {
      const providerOptions = this.tryResolveProviderOptions(providerRef);

      if (!providerOptions) {
        throw new ContainerCompilerException(
          `Missing module ${moduleId} provider ${resolveName(providerRef)} metadata`,
        );
      }

      const { token, ...providerCompiled } = providerOptions;
      compiled.providers.set(Id.for(token), providerCompiled);
    }

    // exports

    for (const providerToken of options.exports) {
      const providerId = this.resolveProviderToken(providerToken);

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
            throw new ContainerCompilerException(
              `Provider ${providerId} is exported by multiple modules`,
            );
          }

          exportModuleId = importedModuleId;
        }
      }

      if (!exportModuleId) {
        throw new ContainerCompilerException(
          `Provider ${providerId} not found in ${moduleId} module`,
        );
      }

      compiled.exports.set(providerId, exportModuleId);
    }

    return moduleId;
  }

  private tryResolveModuleOptions(
    moduleRef: ModuleRef,
  ): ModuleOptionsNormalized | undefined {
    let entrypointRef: ProviderRef | undefined;
    let options: ModuleOptions | undefined;

    if (isClass(moduleRef)) {
      entrypointRef = moduleRef;
      options = getDecoratorMetadata(moduleRef, MODULE_METADATA_KEY);

      if (!options) {
        return;
      }
    } else {
      options = moduleRef as ModuleOptions;
    }

    return {
      entrypointRef,
      extends: options.extends,
      imports: options.imports?.filter(notEmpty) ?? [],
      controllers: options.controllers?.filter(notEmpty) ?? [],
      providers: options.providers?.filter(notEmpty) ?? [],
      exports: options.exports?.filter(notEmpty) ?? [],
    };
  }

  private tryResolveProviderOptions(
    providerRef: ProviderRef,
  ): ProviderOptionsNormalized | undefined {
    let options: AnyProviderOptions | undefined;

    if (isClass(providerRef)) {
      options = getDecoratorMetadata(providerRef, PROVIDER_METADATA_KEY);
    } else if (isFn(providerRef)) {
      options = { useFactory: providerRef };
    } else {
      options = providerRef as AnyProviderOptions;
    }

    if (!options) {
      return;
    }

    if ('useClass' in options) {
      const {
        useClass, //
        token = useClass,
        scope = DEFAULT_PROVIDER_SCOPE,
        injects = [],
      } = options;

      return {
        token,
        kind: 'class',
        scope,
        useClass,
        injects: injects
          .filter(notEmpty)
          .map((options) => this.resolveProviderInjection(options)),
      };
    } else if ('useFactory' in options) {
      const {
        useFactory,
        token = useFactory,
        scope = DEFAULT_PROVIDER_SCOPE,
        injects = [],
      } = options;

      return {
        token,
        kind: 'factory',
        scope,
        useFactory,
        injects: injects
          .filter(notEmpty)
          .map((token) => this.resolveProviderInjection(token)),
      };
    } else if ('useValue' in options) {
      const {
        useValue, //
        token,
      } = options;

      return {
        token,
        kind: 'value',
        useValue,
      };
    }
  }

  private resolveProviderInjection(options: ProviderInjectionOptions): ProviderInjection {
    if (isObject(options) && 'token' in options && 'optional' in options) {
      return {
        providerId: this.resolveProviderToken(options.token),
        optional: options.optional,
      };
    }

    return {
      providerId: this.resolveProviderToken(options),
      optional: false,
    };
  }

  private resolveProviderToken(token: Token): Id {
    if (isObject(token)) {
      if ('token' in token) {
        return Id.for(token.token as symbol);
      } else if ('useClass' in token) {
        return Id.for(token.useClass as Class);
      } else if ('useFactory' in token) {
        return Id.for(token.useFactory as Fn);
      }
    }

    return Id.for(token);
  }
}
