import { describe, expect, it } from 'bun:test';
import type { Class } from '@bunito/common';
import { MODULE_ID, PARENT_MODULE_IDS, REQUEST_ID, ROOT_MODULE_ID } from './constants';
import { Container } from './container';
import { Module, OnBoot, OnDestroy, OnInit, OnResolve, Provider } from './decorators';
import { Id } from './id';

declare global {
  namespace Bonito {
    interface ModuleComponents {
      widgets: Class[];
    }
  }
}

describe('Container', () => {
  it('resolves providers and guards repeated lifecycle actions', async () => {
    @Provider({
      scope: 'singleton',
      injects: [
        REQUEST_ID,
        MODULE_ID,
        ROOT_MODULE_ID,
        PARENT_MODULE_IDS,
        { token: 'optional', optional: true },
        { token: 'fallback', defaultValue: 'fallback-value' },
      ],
    })
    class LifecycleProvider {
      static onBootCount = 0;

      static onDestroyCount = 0;

      static onResolveCount = 0;

      static initCount = 0;

      constructor(
        readonly requestId: Id | undefined,
        readonly moduleId: Id,
        readonly rootModuleId: Id,
        readonly parentModuleIds: Set<Id>,
        readonly optionalValue: null,
        readonly fallbackValue: string,
      ) {}

      @OnInit()
      onInit(): void {
        LifecycleProvider.initCount += 1;
      }

      @OnResolve()
      onResolve(): void {
        LifecycleProvider.onResolveCount += 1;
      }

      @OnBoot()
      onBoot(): void {
        LifecycleProvider.onBootCount += 1;
      }

      @OnDestroy()
      onDestroy(): void {
        LifecycleProvider.onDestroyCount += 1;
      }
    }

    @Provider({ scope: 'request' })
    class RequestScopedProvider {
      static instances = 0;

      readonly id = ++RequestScopedProvider.instances;
    }

    @Module({
      uses: [
        LifecycleProvider,
        RequestScopedProvider,
        {
          token: 'value',
          useValue: 42,
        },
      ],
      exports: [LifecycleProvider, 'value'],
    })
    class ChildModule {}

    @Module({
      imports: [ChildModule],
      exports: [LifecycleProvider],
    })
    class RootModule {}

    const container = new Container(RootModule);
    const requestId = Id.unique('Request');
    const childModuleId = Id.for(ChildModule);

    const lifecycle = await container.resolveProvider(LifecycleProvider, { requestId });
    const requestScopedA = await container.resolveProvider(RequestScopedProvider, {
      requestId,
      moduleId: childModuleId,
    });
    const requestScopedB = await container.resolveProvider(RequestScopedProvider, {
      requestId,
      moduleId: childModuleId,
    });
    const requestScopedC = await container.resolveProvider(RequestScopedProvider, {
      requestId: Id.unique('Request'),
      moduleId: childModuleId,
    });

    expect(lifecycle.optionalValue).toBeNull();
    expect(lifecycle.fallbackValue).toBe('fallback-value');
    expect(lifecycle.requestId).toBe(requestId);
    expect(lifecycle.rootModuleId).toBe(Id.for(RootModule));
    expect(lifecycle.parentModuleIds).toEqual(new Set([Id.for(RootModule)]));
    expect(requestScopedA).toBe(requestScopedB);
    expect(requestScopedA).not.toBe(requestScopedC);
    expect(await container.resolveProvider<number>('value')).toBe(42);
    expect(await container.tryResolveProvider('missing')).toBeUndefined();
    expect(container.getExtensions(Symbol('missing'))).toEqual([]);
    expect(container.getComponents(Symbol('missing'))).toEqual([]);

    await container.boot();
    await container.cleanup(requestId);
    await container.destroy();

    expect(LifecycleProvider.initCount).toBe(1);
    expect(LifecycleProvider.onResolveCount).toBeGreaterThanOrEqual(1);
    expect(LifecycleProvider.onBootCount).toBe(1);
    expect(LifecycleProvider.onDestroyCount).toBe(1);

    expect(container.boot()).rejects.toThrow('Container boot cannot be called twice');
    expect(container.destroy()).rejects.toThrow(
      'Container destroy cannot be called twice',
    );
  });
});
