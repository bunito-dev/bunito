import { describe, expect, it } from 'bun:test';
import { MODULE_ID, PARENT_MODULE_IDS, REQUEST_ID, ROOT_MODULE_ID } from './constants';
import { ContainerCompiler } from './container-compiler';
import { ContainerRuntime } from './container-runtime';
import { Module, OnBoot, OnDestroy, OnInit, OnResolve, Provider } from './decorators';
import { Id } from './id';

describe('ContainerRuntime', () => {
  it('resolves providers and lifecycle hooks', async () => {
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

    const compiler = new ContainerCompiler(RootModule);
    const runtime = new ContainerRuntime(compiler);
    const requestId = Id.unique('Request');
    const childModuleId = Id.for(ChildModule);

    const lifecycle = (await runtime.resolveProvider(Id.for(LifecycleProvider), {
      requestId,
    })) as LifecycleProvider;
    const requestScopedA = await runtime.resolveProvider(Id.for(RequestScopedProvider), {
      requestId,
      moduleId: childModuleId,
    });
    const requestScopedB = await runtime.resolveProvider(Id.for(RequestScopedProvider), {
      requestId,
      moduleId: childModuleId,
    });
    const requestScopedC = await runtime.resolveProvider(Id.for(RequestScopedProvider), {
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
    expect(await runtime.resolveProvider(Id.for('value'))).toBe(42);

    await runtime.bootModule();
    await runtime.destroyProviders(requestId);
    await runtime.destroyScopes();

    expect(LifecycleProvider.initCount).toBe(1);
    expect(LifecycleProvider.onResolveCount).toBeGreaterThanOrEqual(1);
    expect(LifecycleProvider.onBootCount).toBe(1);
    expect(LifecycleProvider.onDestroyCount).toBe(1);
  });

  it('handles stored providers and missing injections', async () => {
    const providerId = Id.for('provider');
    const scopeId = Id.unique('Scope');
    const compiler = {
      rootModuleId: Id.for('root'),
      getProvider: () => [],
      getModule: () => ({
        parents: new Set<Id>(),
        providers: { definitions: new Map(), available: new Map(), exported: new Set() },
        children: new Set(),
        components: {},
      }),
    } as unknown as ContainerCompiler;

    const runtime = new ContainerRuntime(compiler);
    const calls: string[] = [];

    runtime.setProvider(
      providerId,
      { value: 1 },
      {
        scopeId,
        onResolve: async () => {
          calls.push('resolve');
        },
        onDestroy: async () => {
          calls.push('destroy');
        },
      },
    );

    expect(await runtime.tryGetProvider(providerId, scopeId)).toEqual({ value: 1 });

    await runtime.destroyProviders(scopeId);
    await runtime.destroyScopes();

    expect(calls).toEqual(['resolve', 'destroy']);
    expect(
      runtime.resolveProviderArgs(
        providerId,
        [{ providerId: Id.for('missing'), defaultValue: undefined }],
        {},
      ),
    ).rejects.toThrow('Missing missing#1 at #0 is provider#1 provider');
  });

  it('rejects non-resolve lifecycle handlers when called twice', async () => {
    const runtime = new ContainerRuntime({
      rootModuleId: Id.for('root'),
      getProvider: () => [],
      getModule: () => ({
        parents: new Set<Id>(),
        providers: { definitions: new Map(), available: new Map(), exported: new Set() },
        children: new Set(),
        components: {},
      }),
    } as unknown as ContainerCompiler);

    const instance = {
      async onBoot() {
        return;
      },
    };

    const handler = (
      runtime as unknown as {
        createProviderHandler: (
          instance: object,
          event: 'onBoot',
          events: { onBoot: 'onBoot' },
        ) => (() => Promise<void>) | undefined;
      }
    ).createProviderHandler(instance, 'onBoot', {
      onBoot: 'onBoot',
    });

    expect(handler).toBeFunction();

    await handler?.();
    expect(handler?.()).rejects.toThrow('Provider handler onBoot cannot be called twice');
  });
});
