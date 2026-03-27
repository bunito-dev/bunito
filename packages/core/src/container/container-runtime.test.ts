import { describe, expect, it } from 'bun:test';
import { PROVIDER_HOOK_METADATA_KEYS } from './constants';
import { ContainerCompiler } from './container-compiler';
import { ContainerRuntime } from './container-runtime';
import { Id } from './id';

function defineMetadata(target: object, metadata: DecoratorMetadataObject): void {
  Object.defineProperty(target, Symbol.metadata, {
    value: metadata,
    configurable: true,
  });
}

describe('ContainerRuntime', () => {
  it('should resolve class providers with injections and trigger setup hooks once', async () => {
    class Service {
      setupRuns = 0;

      constructor(readonly dependency: string) {}

      onSetup(): void {
        this.setupRuns += 1;
      }
    }

    defineMetadata(Service, {
      [PROVIDER_HOOK_METADATA_KEYS.setup]: new Set(['onSetup']),
    });

    const moduleRef = {
      providers: [
        { token: 'dep', useValue: 'injected' },
        { useClass: Service, injects: ['dep'] },
      ],
    };
    const compiler = new ContainerCompiler();
    const moduleId = compiler.compileModule(moduleRef);
    const runtime = new ContainerRuntime(compiler);

    const instance = await runtime.resolveProvider<Service>(Id.for(Service), {
      moduleId,
    });
    const sameInstance = await runtime.resolveProvider<Service>(Id.for(Service), {
      moduleId,
    });

    expect(instance.dependency).toBe('injected');
    expect(instance.setupRuns).toBe(1);
    expect(sameInstance).toBe(instance);
  });

  it('should resolve request-scoped factories per request and support optional injections', async () => {
    const requestScopedFactory = (dependency: string, optionalValue: unknown) => ({
      dependency,
      optionalValue,
    });
    const moduleRef = {
      providers: [
        { token: 'dep', useValue: 'injected' },
        {
          token: 'factory-token',
          useFactory: requestScopedFactory,
          scope: 'request' as const,
          injects: ['dep', { token: 'missing', optional: true }],
        },
      ],
    };
    const compiler = new ContainerCompiler();
    const moduleId = compiler.compileModule(moduleRef);
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

    expect(first).toBe(second);
    expect(third).not.toBe(first);
    expect(first.optionalValue).toBeNull();
    expect(first.dependency).toBe('injected');
  });

  it('should create new instances for transient providers', async () => {
    class TransientService {}

    const compiler = new ContainerCompiler();
    const moduleId = compiler.compileModule({
      providers: [{ useClass: TransientService, scope: 'transient' }],
    });
    const runtime = new ContainerRuntime(compiler);

    const first = await runtime.resolveProvider(Id.for(TransientService), { moduleId });
    const second = await runtime.resolveProvider(Id.for(TransientService), { moduleId });

    expect(first).not.toBe(second);
  });

  it('should return undefined from tryResolveProvider when the provider is missing', async () => {
    const compiler = new ContainerCompiler();
    const moduleId = compiler.compileModule({});
    const runtime = new ContainerRuntime(compiler);

    expect(
      await runtime.tryResolveProvider(Id.for('missing'), { moduleId }),
    ).toBeUndefined();
  });

  it('should throw when a required injection cannot be resolved', async () => {
    class Service {
      constructor(readonly missing: unknown) {}
    }

    const compiler = new ContainerCompiler();
    const moduleId = compiler.compileModule({
      providers: [{ useClass: Service, injects: ['missing'] }],
    });
    const runtime = new ContainerRuntime(compiler);

    expect(
      runtime.resolveProvider(Id.for(Service), {
        moduleId,
      }),
    ).rejects.toThrow(`Injection ${Id.for('missing')}`);
  });

  it('should prevent provider hooks from being triggered twice', async () => {
    class Service {
      runs = 0;

      onBootstrap(): void {
        this.runs += 1;
      }
    }

    defineMetadata(Service, {
      [PROVIDER_HOOK_METADATA_KEYS.bootstrap]: new Set(['onBootstrap']),
    });

    const runtime = new ContainerRuntime(new ContainerCompiler());
    const instance = new Service();

    await runtime.triggerProviderHook(instance, 'bootstrap');

    expect(instance.runs).toBe(1);
    expect(runtime.triggerProviderHook(instance, 'bootstrap')).rejects.toThrow(
      'cannot be called twice',
    );
  });

  it('should trigger destroy hooks when destroying a concrete scope', async () => {
    let destroyRuns = 0;

    class RequestService {
      onDestroy(): void {
        destroyRuns += 1;
      }
    }

    defineMetadata(RequestService, {
      [PROVIDER_HOOK_METADATA_KEYS.destroy]: new Set(['onDestroy']),
    });

    const compiler = new ContainerCompiler();
    const moduleId = compiler.compileModule({
      providers: [{ useClass: RequestService, scope: 'request' }],
    });
    const runtime = new ContainerRuntime(compiler);
    const requestId = Id.unique('request');

    await runtime.resolveProvider(Id.for(RequestService), {
      moduleId,
      requestId,
    });
    await runtime.destroyScope(requestId);

    expect(destroyRuns).toBe(1);
  });

  it('should trigger destroy hooks for all scoped instances when destroying all scopes', async () => {
    let destroyRuns = 0;

    class RequestService {
      onDestroy(): void {
        destroyRuns += 1;
      }
    }

    defineMetadata(RequestService, {
      [PROVIDER_HOOK_METADATA_KEYS.destroy]: new Set(['onDestroy']),
    });

    const compiler = new ContainerCompiler();
    const moduleId = compiler.compileModule({
      providers: [{ useClass: RequestService, scope: 'request' }],
    });
    const runtime = new ContainerRuntime(compiler);

    await runtime.resolveProvider(Id.for(RequestService), {
      moduleId,
      requestId: Id.unique('request'),
    });
    await runtime.resolveProvider(Id.for(RequestService), {
      moduleId,
      requestId: Id.unique('request'),
    });
    await runtime.destroyScope();

    expect(destroyRuns).toBe(2);
  });

  it('should remove scoped instances from cache after destroyScope', async () => {
    class RequestService {}

    const compiler = new ContainerCompiler();
    const moduleId = compiler.compileModule({
      providers: [{ useClass: RequestService, scope: 'request' }],
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
});
