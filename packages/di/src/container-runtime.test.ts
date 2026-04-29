import { describe, expect, it } from 'bun:test';
import {
  MODULE_ID,
  PARENT_MODULE_IDS,
  PARENT_PROVIDER_ID,
  PROVIDER_OPTIONS,
  REQUEST_ID,
  ROOT_MODULE_ID,
} from './constants';
import { ContainerCompiler } from './container-compiler';
import { ContainerRuntime } from './container-runtime';
import { Module, OnDestroy, OnInit, OnResolve, Provider } from './decorators';
import { Id } from './id';

describe('ContainerRuntime', () => {
  it('resolves values, classes, factories, injections, groups, and lifecycle hooks', async () => {
    const pluginGroup = Symbol('plugin-group');
    const fallbackToken = Symbol('fallback');
    const requestId = Id.unique('Request');
    const events: string[] = [];

    @Provider({ group: pluginGroup })
    class ClassPlugin {
      readonly name = 'class-plugin';
    }

    @Provider()
    class SingletonProvider {
      static instances = 0;

      readonly id = ++SingletonProvider.instances;
    }

    class ModuleScopedProvider {
      static instances = 0;

      readonly id = ++ModuleScopedProvider.instances;
    }

    class RootModuleScopedProvider {}

    class RequestScopedProvider {
      static instances = 0;

      readonly id = ++RequestScopedProvider.instances;

      constructor(readonly requestId: Id | null) {}
    }

    class TransientProvider {
      static instances = 0;

      readonly id = ++TransientProvider.instances;
    }

    @Provider({
      injects: [
        MODULE_ID,
        ROOT_MODULE_ID,
        PARENT_MODULE_IDS,
        REQUEST_ID,
        PROVIDER_OPTIONS,
        PARENT_PROVIDER_ID,
        'literal',
        { useToken: 'value-token' },
        { useToken: 'missing', optional: true },
        { useToken: fallbackToken, options: { from: 'schema' } },
        { useValue: 'inline-value' },
        { useBuilder: (options: unknown) => ({ built: options }), options: 'builder' },
        { useGroup: pluginGroup },
        SingletonProvider,
        ModuleScopedProvider,
        RequestScopedProvider,
        TransientProvider,
      ],
    })
    class Consumer {
      static initCount = 0;

      static resolveCount = 0;

      static destroyCount = 0;

      constructor(
        readonly moduleId: Id,
        readonly rootModuleId: Id,
        readonly parentModuleIds: Set<Id>,
        readonly requestId: Id | null,
        readonly providerOptions: unknown,
        readonly parentProviderId: Id,
        readonly literal: string,
        readonly value: number,
        readonly optional: null,
        readonly fallback: string,
        readonly inlineValue: string,
        readonly builtValue: unknown,
        readonly plugins: unknown[],
        readonly singleton: SingletonProvider,
        readonly moduleScoped: ModuleScopedProvider,
        readonly requestScoped: RequestScopedProvider,
        readonly transient: TransientProvider,
      ) {}

      @OnInit({ injects: ['init'] })
      init(value: string): void {
        Consumer.initCount += 1;
        events.push(value);
      }

      @OnResolve({ injects: ['resolve'] })
      resolve(value: string): void {
        Consumer.resolveCount += 1;
        events.push(value);
      }

      @OnDestroy({ injects: ['destroy'] })
      destroy(value: string): void {
        Consumer.destroyCount += 1;
        events.push(value);
      }
    }

    @Module({
      providers: [
        ClassPlugin,
        SingletonProvider,
        {
          useClass: ModuleScopedProvider,
          scope: 'module',
        },
        {
          useClass: RequestScopedProvider,
          scope: 'request',
          injects: [REQUEST_ID],
        },
        {
          useClass: TransientProvider,
          scope: 'transient',
        },
        {
          token: 'factory-plugin',
          group: pluginGroup,
          useFactory: () => ({ name: 'factory-plugin' }),
        },
        {
          token: 'value-token',
          useValue: 42,
        },
        Consumer,
      ],
      exports: [Consumer, ClassPlugin, 'factory-plugin', 'value-token'],
    })
    class ChildModule {}

    @Module({
      imports: [ChildModule],
      providers: [
        {
          token: 'root-module-scoped',
          useFactory: () => new RootModuleScopedProvider(),
          scope: 'module',
        },
      ],
      exports: [ChildModule],
    })
    class RootModule {}

    const compiler = new ContainerCompiler(RootModule);
    const runtime = new ContainerRuntime(compiler);
    const childModuleId = Id.for(ChildModule);

    const resolvedConsumer = await runtime.resolveProvider<Consumer>(Id.for(Consumer), {
      moduleId: childModuleId,
      requestId,
      providerOptions: { from: 'caller' },
      resolveInjection: (token, options) => {
        if (Id.for(token).toString() === Id.for(fallbackToken).toString()) {
          expect(options).toEqual({ from: 'schema' });
          return 'resolved-by-callback';
        }
      },
    });
    const consumer = resolvedConsumer as Consumer;

    expect(consumer).toBeInstanceOf(Consumer);
    expect(consumer.moduleId).toBe(childModuleId);
    expect(consumer.rootModuleId).toBe(Id.for(RootModule));
    expect(consumer.parentModuleIds).toEqual(new Set([Id.for(RootModule)]));
    expect(consumer.requestId).toBeNull();
    expect(consumer.providerOptions).toEqual({ from: 'caller' });
    expect(consumer.parentProviderId).toBe(Id.for(Consumer));
    expect(consumer.literal).toBe('literal');
    expect(consumer.value).toBe(42);
    expect(consumer.optional).toBeNull();
    expect(consumer.fallback).toBe('resolved-by-callback');
    expect(consumer.inlineValue).toBe('inline-value');
    expect(consumer.builtValue).toEqual({ built: 'builder' });
    expect(consumer.plugins).toHaveLength(2);
    expect(consumer.requestScoped.requestId).toBeNull();
    expect(Consumer.initCount).toBe(1);
    expect(Consumer.resolveCount).toBe(0);

    const consumerAgain = await runtime.resolveProvider<Consumer>(Id.for(Consumer), {
      moduleId: childModuleId,
    });
    expect(consumerAgain).toBe(consumer);
    expect(Consumer.resolveCount).toBe(1);

    const otherRequestScoped = (await runtime.resolveProvider<RequestScopedProvider>(
      Id.for(RequestScopedProvider),
      {
        moduleId: childModuleId,
        requestId: Id.unique('Request'),
      },
    )) as RequestScopedProvider;
    expect(otherRequestScoped).not.toBe(consumer.requestScoped);
    expect(otherRequestScoped.requestId).toBeDefined();

    const transientA = await runtime.resolveProvider<TransientProvider>(
      Id.for(TransientProvider),
      {
        moduleId: childModuleId,
      },
    );
    const transientB = await runtime.resolveProvider<TransientProvider>(
      Id.for(TransientProvider),
      {
        moduleId: childModuleId,
      },
    );
    expect(transientA).not.toBe(transientB);

    const valueToken = await runtime.resolveProvider<number>(Id.for('value-token'), {
      moduleId: childModuleId,
    });
    const missing = await runtime.resolveProvider(Id.for('missing'), {}, false);

    expect(valueToken).toBe(42);
    expect(missing).toBeUndefined();

    let missingProviderError: unknown;
    try {
      await runtime.resolveProvider(Id.for('missing'));
    } catch (error) {
      missingProviderError = error;
    }
    expect(missingProviderError).toBeInstanceOf(Error);
    expect((missingProviderError as Error).message).toContain('Provider missing');

    let unavailableProviderError: unknown;
    try {
      await runtime.resolveProvider(Id.for('root-module-scoped'), {
        moduleId: childModuleId,
      });
    } catch (error) {
      unavailableProviderError = error;
    }
    expect(unavailableProviderError).toBeInstanceOf(Error);
    expect((unavailableProviderError as Error).message).toContain('was not found in');

    let missingInjectionError: unknown;
    try {
      await runtime.resolveInjections(Id.for(Consumer), [
        { useToken: 'missing-required' },
      ]);
    } catch (error) {
      missingInjectionError = error;
    }
    expect(missingInjectionError).toBeInstanceOf(Error);
    expect((missingInjectionError as Error).message).toContain('Cannot inject');

    const manualScope = Id.unique('ManualScope');
    runtime.setProvider(
      Id.for('manual'),
      { ok: true },
      {
        scopeId: manualScope,
        onResolve: async () => {
          events.push('manual-resolve');
        },
        onDestroy: async () => {
          events.push('manual-destroy');
        },
      },
    );
    const manual = await runtime.getProvider<{ ok: boolean }>(Id.for('manual'), {
      scopeId: manualScope,
    });
    const destroyedManualProviders = await runtime.destroyProviders(manualScope);
    const destroyedMissingScopeProviders = await runtime.destroyProviders(
      Id.unique('missing-scope'),
    );

    expect(manual).toEqual({
      ok: true,
    });
    expect(destroyedManualProviders).toBe(1);
    expect(destroyedMissingScopeProviders).toBe(0);

    await runtime.destroyProviders(requestId);
    await runtime.destroyProviders();

    expect(Consumer.destroyCount).toBe(1);
    expect(events).toEqual([
      'init',
      'resolve',
      'manual-resolve',
      'manual-destroy',
      'destroy',
    ]);
  });

  it('falls back to onResolve when onInit is absent and guards disposable handlers', async () => {
    @Provider()
    class ResolveOnlyProvider {
      static resolveCount = 0;

      @OnResolve()
      resolve(): void {
        ResolveOnlyProvider.resolveCount += 1;
      }

      @OnDestroy()
      destroy(): void {
        //
      }
    }

    @Module({
      providers: [ResolveOnlyProvider],
    })
    class RootModule {}

    const compiler = new ContainerCompiler(RootModule);
    const runtime = new ContainerRuntime(compiler);
    const providerId = Id.for(ResolveOnlyProvider);
    const instance = await runtime.resolveProvider<ResolveOnlyProvider>(providerId);

    expect(ResolveOnlyProvider.resolveCount).toBe(1);
    expect(
      runtime.createProviderHandler(providerId, 'not-an-object', OnDestroy),
    ).toBeUndefined();

    const destroy = runtime.createProviderHandler(providerId, instance, OnDestroy);
    expect(destroy).toBeFunction();
    await destroy?.();
    let secondDestroyError: unknown;
    try {
      await destroy?.();
    } catch (error) {
      secondDestroyError = error;
    }
    expect(secondDestroyError).toBeInstanceOf(Error);
    expect((secondDestroyError as Error).message).toContain('called more than once');
  });

  it('returns an empty argument list when no injections are defined', async () => {
    @Module()
    class RootModule {}

    const runtime = new ContainerRuntime(new ContainerCompiler(RootModule));

    const args = await runtime.resolveInjections(Id.for('parent'), undefined);

    expect(args).toEqual([]);
  });

  it('returns value providers directly without lifecycle tracking', async () => {
    const calls: string[] = [];

    class ValueWithHooks {
      @OnResolve()
      resolve(): void {
        calls.push('resolve');
      }

      @OnDestroy()
      destroy(): void {
        calls.push('destroy');
      }
    }

    const value = new ValueWithHooks();

    @Module({
      providers: [
        {
          token: 'value-with-hooks',
          useValue: value,
        },
      ],
    })
    class RootModule {}

    const runtime = new ContainerRuntime(new ContainerCompiler(RootModule));
    const providerId = Id.for('value-with-hooks');
    const resolvedA = await runtime.resolveProvider(providerId);
    const resolvedB = await runtime.resolveProvider(providerId);
    const destroyed = await runtime.destroyProviders();

    expect(resolvedA).toBe(value);
    expect(resolvedB).toBe(value);
    expect(destroyed).toBe(0);
    expect(calls).toEqual([]);
  });

  it('treats request-scoped providers without request ids as transient', async () => {
    @Provider({
      scope: 'request',
      injects: [REQUEST_ID],
    })
    class RequestScopedProvider {
      static instances = 0;

      readonly id = ++RequestScopedProvider.instances;

      constructor(readonly requestId: Id | null) {}
    }

    @Module({
      providers: [RequestScopedProvider],
    })
    class RootModule {}

    const runtime = new ContainerRuntime(new ContainerCompiler(RootModule));
    const providerId = Id.for(RequestScopedProvider);
    const resolvedA = await runtime.resolveProvider<RequestScopedProvider>(providerId);
    const resolvedB = await runtime.resolveProvider<RequestScopedProvider>(providerId);

    expect(resolvedA).toBeInstanceOf(RequestScopedProvider);
    expect(resolvedB).toBeInstanceOf(RequestScopedProvider);
    expect(resolvedA).not.toBe(resolvedB);
    expect(resolvedA?.requestId).toBeNull();
    expect(resolvedB?.requestId).toBeNull();
  });
});
