import { describe, expect, it } from 'bun:test';
import { Container } from './container';
import type { ContainerCompiler } from './container-compiler';
import { Controller, Module, OnBoot, OnDestroy, OnInit, Provider } from './decorators';
import { Id } from './id';

describe('Container', () => {
  it('should resolve the container instance itself', async () => {
    const container = new Container({});

    expect(await container.resolveProvider(Container)).toBe(container);
  });

  it('should collect controller trees and eagerly resolve bootable providers from imported modules', async () => {
    let importedInitRuns = 0;

    @Controller()
    class RootController {}

    @Controller()
    class ImportedController {}

    @Module({
      controllers: [ImportedController],
    })
    class ImportedModule {
      @OnInit()
      onInit(): void {
        importedInitRuns += 1;
      }

      @OnBoot()
      onBoot(): void {}
    }

    @Module({
      imports: [ImportedModule],
      controllers: [RootController],
    })
    class RootModule {}

    const container = new Container(RootModule);

    await container.setup();

    expect(container.controllers).toEqual([
      {
        moduleId: Id.for(RootModule),
        parentClasses: [RootModule],
        useClass: RootController,
      },
      {
        moduleId: Id.for(ImportedModule),
        parentClasses: [RootModule, ImportedModule],
        useClass: ImportedController,
      },
    ]);
    expect(importedInitRuns).toBe(1);
  });

  it('should bootstrap and destroy providers, and reject repeated lifecycle entrypoints', async () => {
    let destroyRuns = 0;

    @Provider({
      scope: 'request',
    })
    class RequestScopedService {
      @OnDestroy()
      onDestroy(): void {
        destroyRuns += 1;
      }
    }

    @Module({
      providers: [RequestScopedService],
    })
    class AppModule {
      bootRuns = 0;

      @OnBoot()
      onBoot(): void {
        this.bootRuns += 1;
      }
    }

    const container = new Container(AppModule);
    const requestId = Id.create('request');

    await container.setup();
    await container.resolveProvider(RequestScopedService, { requestId });
    await container.boot();
    expect((await container.resolveProvider(AppModule)).bootRuns).toBe(1);

    expect(container.setup()).rejects.toThrow('cannot be called twice');
    expect(container.boot()).rejects.toThrow('cannot be called twice');

    await container.destroy();
    expect(destroyRuns).toBe(1);
    expect(container.destroy()).rejects.toThrow('cannot be called twice');
  });

  it('should return undefined from tryResolveProvider when the provider does not exist', async () => {
    const container = new Container({});

    expect(await container.tryResolveProvider('missing')).toBeUndefined();
  });

  it('should tolerate missing or non-class controller matches while traversing modules', async () => {
    const moduleId = Id.create('module');
    const compiler = {
      compileModule: () => moduleId,
      getModule: () => ({
        useClass: undefined,
        controllers: new Set([Id.for('missing-controller'), Id.for('value-controller')]),
        providers: new Map(),
        imports: new Set(),
        exports: new Map(),
      }),
      locateProvider: (providerId: Id) => {
        if (providerId === Id.for('value-controller')) {
          return {
            moduleId,
            provider: {
              kind: 'value' as const,
              useValue: 'ignored',
            },
          };
        }

        return undefined;
      },
    } as unknown as ContainerCompiler;
    const container = new Container({}, compiler);

    await container.setup();

    expect(container.controllers).toEqual([]);
  });
});
