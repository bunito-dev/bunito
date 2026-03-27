import { describe, expect, it } from 'bun:test';
import {
  MODULE_METADATA_KEY,
  PROVIDER_HOOK_METADATA_KEYS,
  PROVIDER_METADATA_KEY,
} from './constants';
import { Container } from './container';
import { Id } from './id';

type ClassLike = abstract new (...args: never) => unknown;

function defineMetadata(target: object, metadata: DecoratorMetadataObject): void {
  Object.defineProperty(target, Symbol.metadata, {
    value: metadata,
    configurable: true,
  });
}

function defineProvider(
  target: ClassLike,
  options: Record<PropertyKey, unknown> = {},
): void {
  const existingMetadata = ((
    target as typeof target & { [Symbol.metadata]?: DecoratorMetadataObject }
  )[Symbol.metadata] ?? {}) as DecoratorMetadataObject;

  defineMetadata(target, {
    ...existingMetadata,
    [PROVIDER_METADATA_KEY]: {
      useClass: target,
      ...options,
    },
  });
}

function defineModule(
  target: ClassLike,
  moduleOptions: Record<PropertyKey, unknown>,
): void {
  const existingMetadata = ((
    target as typeof target & { [Symbol.metadata]?: DecoratorMetadataObject }
  )[Symbol.metadata] ?? {}) as DecoratorMetadataObject;

  defineMetadata(target, {
    ...existingMetadata,
    [MODULE_METADATA_KEY]: moduleOptions,
    [PROVIDER_METADATA_KEY]: {
      useClass: target,
      scope: 'module',
      injects: [],
    },
  });
}

describe('Container', () => {
  it('should resolve the container instance itself', async () => {
    const container = new Container({});

    expect(await container.resolveProvider(Container)).toBe(container);
  });

  it('should collect controller class stacks and setup imported module entrypoints', async () => {
    let importedSetupRuns = 0;

    class RootModule {
      setupRuns = 0;

      onSetup(): void {
        this.setupRuns += 1;
      }
    }

    class ImportedModule {
      onSetup(): void {
        importedSetupRuns += 1;
      }
    }

    class RootController {}
    class ImportedController {}

    defineMetadata(RootModule, {
      [PROVIDER_HOOK_METADATA_KEYS.setup]: new Set(['onSetup']),
    });
    defineModule(RootModule, {
      imports: [ImportedModule],
      controllers: [RootController],
    });

    defineMetadata(ImportedModule, {
      [PROVIDER_HOOK_METADATA_KEYS.setup]: new Set(['onSetup']),
    });
    defineModule(ImportedModule, {
      controllers: [ImportedController],
    });

    defineProvider(RootController, {
      scope: 'request',
    });
    defineProvider(ImportedController, {
      scope: 'request',
    });

    const container = new Container(RootModule);

    await container.setupEntrypoints();

    expect(container.controllers).toEqual([
      {
        moduleId: Id.for(RootModule),
        classStack: [RootModule, RootController],
      },
      {
        moduleId: Id.for(ImportedModule),
        classStack: [RootModule, ImportedModule, ImportedController],
      },
    ]);
    expect((await container.resolveProvider(RootModule)).setupRuns).toBe(1);
    expect(importedSetupRuns).toBe(1);
  });

  it('should bootstrap entrypoints with synchronous hooks', async () => {
    class AppModule {
      bootstrapRuns = 0;

      onBootstrap(): void {
        this.bootstrapRuns += 1;
      }
    }

    defineMetadata(AppModule, {
      [PROVIDER_HOOK_METADATA_KEYS.bootstrap]: new Set(['onBootstrap']),
    });
    defineModule(AppModule, {});

    const container = new Container(AppModule);

    await container.setupEntrypoints();
    await container.bootstrapEntrypoints();

    expect((await container.resolveProvider(AppModule)).bootstrapRuns).toBe(1);
  });

  it('should return undefined from tryResolveProvider when the provider does not exist', async () => {
    const container = new Container({});

    expect(await container.tryResolveProvider('missing')).toBeUndefined();
  });

  it('should await asynchronous bootstrap hooks before bootstrapEntrypoints resolves', async () => {
    let bootstrapCompleted = false;

    class AppModule {
      async onBootstrap(): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, 5));
        bootstrapCompleted = true;
      }
    }

    defineMetadata(AppModule, {
      [PROVIDER_HOOK_METADATA_KEYS.bootstrap]: new Set(['onBootstrap']),
    });
    defineModule(AppModule, {});

    const container = new Container(AppModule);

    await container.setupEntrypoints();
    await container.bootstrapEntrypoints();

    expect(bootstrapCompleted).toBeTrue();
  });
});
