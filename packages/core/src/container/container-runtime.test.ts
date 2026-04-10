import { describe, expect, it } from 'bun:test';
import { ContainerCompiler } from './container-compiler';
import { ContainerRuntime } from './container-runtime';
import { OnBoot, OnDestroy, OnInit, OnResolve, Provider } from './decorators';
import { Id } from './id';

describe('ContainerRuntime', () => {
  it('should resolve class providers with injections and trigger init once plus resolve on cache hits', async () => {
    @Provider({
      injects: ['dep'],
    })
    class Service {
      initRuns = 0;
      resolveRuns = 0;

      constructor(readonly dependency: string) {}

      @OnInit()
      onInit(): void {
        this.initRuns += 1;
      }

      @OnResolve()
      onResolve(): void {
        this.resolveRuns += 1;
      }
    }

    const compiler = new ContainerCompiler();
    const moduleId = compiler.compileModule({
      providers: [{ token: 'dep', useValue: 'injected' }, Service],
    });
    const runtime = new ContainerRuntime(compiler);

    const instance = await runtime.resolveProvider<Service>(Id.for(Service), {
      moduleId,
    });
    const sameInstance = await runtime.resolveProvider<Service>(Id.for(Service), {
      moduleId,
    });

    expect(instance).toBeDefined();
    expect(sameInstance).toBeDefined();

    if (!instance || !sameInstance) {
      throw new Error('Expected resolved service instances');
    }

    expect(instance.dependency).toBe('injected');
    expect(instance.initRuns).toBe(1);
    expect(instance.resolveRuns).toBe(1);
    expect(sameInstance).toBe(instance);
  });

  it('should resolve request-scoped factories per request and support optional injections', async () => {
    const requestScopedFactory = (dependency: string, optionalValue: unknown) => ({
      dependency,
      optionalValue,
    });
    const compiler = new ContainerCompiler();
    const moduleId = compiler.compileModule({
      providers: [
        { token: 'dep', useValue: 'injected' },
        {
          token: 'factory-token',
          useFactory: requestScopedFactory,
          scope: 'request' as const,
          injects: ['dep', { token: 'missing', optional: true }],
        },
      ],
    });
    const runtime = new ContainerRuntime(compiler);
    const firstRequestId = Id.unique('request');
    const secondRequestId = Id.unique('request');

    const first = await runtime.resolveProvider<{
      dependency: string;
      optionalValue: unknown;
    }>(Id.for('factory-token'), {
      moduleId,
      requestId: firstRequestId,
    });
    const second = await runtime.resolveProvider<{
      dependency: string;
      optionalValue: unknown;
    }>(Id.for('factory-token'), {
      moduleId,
      requestId: firstRequestId,
    });
    const third = await runtime.resolveProvider<{
      dependency: string;
      optionalValue: unknown;
    }>(Id.for('factory-token'), {
      moduleId,
      requestId: secondRequestId,
    });

    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(third).toBeDefined();

    if (!first || !second || !third) {
      throw new Error('Expected resolved request-scoped instances');
    }

    expect(first).toBe(second);
    expect(third).not.toBe(first);
    expect(first.optionalValue).toBeNull();
    expect(first.dependency).toBe('injected');
  });

  it('should resolve global instances set manually and value providers', async () => {
    const compiler = new ContainerCompiler();
    const moduleId = compiler.compileModule({
      providers: [{ token: 'value-token', useValue: 123 }],
    });
    const runtime = new ContainerRuntime(compiler);

    runtime.setInstance(Id.for('global-token'), 'global-value');

    expect(
      await runtime.resolveProvider<string>(Id.for('global-token'), {
        moduleId,
      }),
    ).toBe('global-value');
    expect(
      await runtime.resolveProvider<number>(Id.for('value-token'), {
        moduleId,
      }),
    ).toBe(123);
  });

  it('should return undefined from tryResolveProvider when the provider is missing', async () => {
    const compiler = new ContainerCompiler();
    const moduleId = compiler.compileModule({});
    const runtime = new ContainerRuntime(compiler);

    expect(
      await runtime.resolveProvider(Id.for('missing'), { moduleId }),
    ).toBeUndefined();
  });

  it('should return undefined when a provider cannot be resolved', async () => {
    const compiler = new ContainerCompiler();
    const moduleId = compiler.compileModule({});
    const runtime = new ContainerRuntime(compiler);

    expect(
      await runtime.resolveProvider(Id.for('missing'), { moduleId }),
    ).toBeUndefined();
  });

  it('should throw when a required injection cannot be resolved', async () => {
    @Provider({
      injects: ['missing'],
    })
    class Service {
      constructor(readonly missing: unknown) {}
    }

    const compiler = new ContainerCompiler();
    const moduleId = compiler.compileModule({
      providers: [Service],
    });
    const runtime = new ContainerRuntime(compiler);

    expect(
      runtime.resolveProvider(Id.for(Service), {
        moduleId,
      }),
    ).rejects.toThrow(`Injection ${Id.for('missing')}`);
  });

  it('should register boot hooks and reject when a non-resolve lifecycle runs twice', async () => {
    @Provider()
    class Service {
      bootRuns = 0;

      @OnBoot()
      onBoot(): void {
        this.bootRuns += 1;
      }
    }

    const compiler = new ContainerCompiler();
    const moduleId = compiler.compileModule({
      providers: [Service],
    });
    const runtime = new ContainerRuntime(compiler);
    const instance = await runtime.resolveProvider<Service>(Id.for(Service), {
      moduleId,
    });

    expect(instance).toBeDefined();

    if (!instance) {
      throw new Error('Expected resolved bootable service');
    }

    await runtime.triggerBootstrap();
    expect(instance.bootRuns).toBe(1);
    await expect(runtime.triggerBootstrap()).rejects.toThrow('cannot be called twice');
  });

  it('should trigger destroy hooks for a concrete scope and when destroying all scopes', async () => {
    let destroyRuns = 0;

    @Provider({
      scope: 'request',
    })
    class RequestService {
      @OnDestroy()
      onDestroy(): void {
        destroyRuns += 1;
      }
    }

    const compiler = new ContainerCompiler();
    const moduleId = compiler.compileModule({
      providers: [RequestService],
    });
    const runtime = new ContainerRuntime(compiler);
    const requestIdA = Id.unique('request');
    const requestIdB = Id.unique('request');

    await runtime.resolveProvider(Id.for(RequestService), {
      moduleId,
      requestId: requestIdA,
    });
    await runtime.resolveProvider(Id.for(RequestService), {
      moduleId,
      requestId: requestIdB,
    });

    await runtime.destroyScope(requestIdA);
    await runtime.destroyScope();

    expect(destroyRuns).toBe(2);
  });

  it('should recreate scoped instances after destroyScope', async () => {
    @Provider({
      scope: 'request',
    })
    class RequestService {}

    const compiler = new ContainerCompiler();
    const moduleId = compiler.compileModule({
      providers: [RequestService],
    });
    const runtime = new ContainerRuntime(compiler);
    const requestId = Id.unique('request');

    const firstInstance = await runtime.resolveProvider(Id.for(RequestService), {
      moduleId,
      requestId,
    });

    await runtime.destroyScope(requestId);

    const secondInstance = await runtime.resolveProvider(Id.for(RequestService), {
      moduleId,
      requestId,
    });

    expect(secondInstance).not.toBe(firstInstance);
  });

  it('should return no lifecycle handlers for non-objects or missing props', () => {
    const runtime = new ContainerRuntime(new ContainerCompiler()) as unknown as {
      processLifecycleHandlers: (
        instance: unknown,
        props?: Map<string, PropertyKey>,
      ) => unknown;
    };

    expect(runtime.processLifecycleHandlers('plain-value')).toEqual({});
    expect(runtime.processLifecycleHandlers({}, undefined)).toEqual({});
  });
});
