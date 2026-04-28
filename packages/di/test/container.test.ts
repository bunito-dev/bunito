import { describe, expect, test } from 'bun:test';
import {
  Container,
  Id,
  MODULE_ID,
  Module,
  OnDestroy,
  OnInit,
  OnResolve,
  Provider,
  REQUEST_ID,
} from '#internals';

describe('Container (integration)', () => {
  test('resolves providers exported by imported modules from the root module', async () => {
    @Provider()
    class ExportedService {
      readonly id = Symbol('exported-service');
    }

    @Provider()
    class PrivateService {}

    @Module({
      providers: [ExportedService, PrivateService],
      exports: [ExportedService],
    })
    class FeatureModule {}

    @Module({
      imports: [FeatureModule],
    })
    class RootModule {}

    const container = new Container(RootModule);
    const exportedFromRoot = await container.resolveProvider(ExportedService);
    const exportedAgain = await container.resolveProvider(ExportedService);
    const privateFromRoot = await container.tryResolveProvider(PrivateService);
    const privateFromFeature = await container.resolveProvider(PrivateService, {
      moduleId: Id.for(FeatureModule),
    });

    expect(exportedFromRoot).toBeInstanceOf(ExportedService);
    expect(exportedAgain).toBe(exportedFromRoot);
    expect(privateFromRoot).toBeUndefined();
    expect(privateFromFeature).toBeInstanceOf(PrivateService);
  });

  test('resolves providers re-exported through module exports', async () => {
    @Provider()
    class LeafService {
      readonly value = 'leaf';
    }

    @Module({
      providers: [LeafService],
      exports: [LeafService],
    })
    class LeafModule {}

    @Module({
      imports: [LeafModule],
      exports: [LeafModule],
    })
    class FeatureModule {}

    @Module({
      imports: [FeatureModule],
      exports: [FeatureModule],
    })
    class RootModule {}

    const container = new Container(RootModule);
    const leaf = await container.resolveProvider(LeafService);

    expect(leaf.value).toBe('leaf');
  });

  test('resolves plain factory providers and exports token-like provider tokens', async () => {
    const factoryToken = {
      token: Symbol('factory-token'),
    };

    function plainFactoryProvider() {
      return 'plain-factory';
    }

    @Module({
      providers: [
        plainFactoryProvider,
        {
          token: factoryToken,
          useFactory: () => 'token-like-factory',
        },
      ],
      exports: [plainFactoryProvider, factoryToken],
    })
    class FeatureModule {}

    @Module({
      imports: [FeatureModule],
    })
    class RootModule {}

    const container = new Container(RootModule);
    const plainFactory = await container.resolveProvider(plainFactoryProvider);
    const tokenLikeFactory = await container.resolveProvider<string>(factoryToken);

    expect(plainFactory).toBe('plain-factory');
    expect(tokenLikeFactory).toBe('token-like-factory');
  });

  test('resolves value providers exported by imported modules', async () => {
    @Module({
      providers: [
        {
          token: 'exported-value',
          useValue: {
            value: 'from-feature',
          },
        },
      ],
      exports: ['exported-value'],
    })
    class FeatureModule {}

    @Module({
      imports: [FeatureModule],
    })
    class RootModule {}

    const container = new Container(RootModule);
    const value = await container.resolveProvider<{ value: string }>('exported-value');

    expect(value).toEqual({
      value: 'from-feature',
    });
  });

  test('resolves global providers from modules that do not import their module', async () => {
    class GlobalService {
      readonly value = 'global';
    }

    @Module({
      providers: [
        {
          global: true,
          useClass: GlobalService,
        },
      ],
    })
    class GlobalsModule {}

    @Module()
    class FeatureModule {}

    @Module({
      imports: [GlobalsModule, FeatureModule],
    })
    class RootModule {}

    const container = new Container(RootModule);
    const globalFromFeature = await container.resolveProvider(GlobalService, {
      moduleId: Id.for(FeatureModule),
    });

    expect(globalFromFeature).toBeInstanceOf(GlobalService);
    expect(globalFromFeature.value).toBe('global');
  });

  test('resolves provider groups contributed by imported modules', async () => {
    const configGroup = Symbol('config-group');

    @Provider({ group: configGroup })
    class DecoratedConfigProvider {
      readonly source = 'decorated';
    }

    @Module({
      providers: [
        DecoratedConfigProvider,
        {
          token: 'factory-config-provider',
          group: configGroup,
          useFactory: () => ({
            source: 'factory',
          }),
        },
      ],
      exports: [DecoratedConfigProvider, 'factory-config-provider'],
    })
    class ConfigModule {}

    @Module({
      imports: [ConfigModule],
    })
    class RootModule {}

    const container = new Container(RootModule);
    const [providers] = await container.resolveInjections('consumer', [
      { useGroup: configGroup },
    ]);

    expect(providers).toEqual([
      expect.any(DecoratedConfigProvider),
      {
        source: 'factory',
      },
    ]);
  });

  test('keeps scope and lifecycle behavior across imported modules', async () => {
    const events: string[] = [];
    const firstRequestId = Id.unique('Request');
    const secondRequestId = Id.unique('Request');

    @Provider({
      injects: [MODULE_ID],
    })
    class SingletonService {
      static instances = 0;

      readonly id = ++SingletonService.instances;

      constructor(readonly moduleId: Id) {}

      @OnInit()
      init(): void {
        events.push(`init:${this.id}`);
      }

      @OnResolve()
      resolve(): void {
        events.push(`resolve:${this.id}`);
      }

      @OnDestroy()
      destroy(): void {
        events.push(`destroy:${this.id}`);
      }
    }

    @Provider({
      scope: 'request',
      injects: [REQUEST_ID],
    })
    class RequestService {
      static instances = 0;

      readonly id = ++RequestService.instances;

      constructor(readonly requestId: Id | null) {}
    }

    @Module({
      providers: [SingletonService, RequestService],
      exports: [SingletonService, RequestService],
    })
    class FeatureModule {}

    @Module({
      imports: [FeatureModule],
    })
    class RootModule {}

    const container = new Container(RootModule);

    const singleton = await container.resolveProvider(SingletonService);
    const singletonAgain = await container.resolveProvider(SingletonService);
    const requestA = await container.resolveProvider(RequestService, {
      requestId: firstRequestId,
    });
    const requestB = await container.resolveProvider(RequestService, {
      requestId: firstRequestId,
    });
    const requestC = await container.resolveProvider(RequestService, {
      requestId: secondRequestId,
    });

    expect(singleton).toBe(singletonAgain);
    expect(singleton.moduleId).toBe(Id.for(FeatureModule));
    expect(requestA).toBe(requestB);
    expect(requestA).not.toBe(requestC);
    expect(requestA.requestId).toBe(firstRequestId);
    expect(requestC.requestId).toBe(secondRequestId);

    await container.destroyRequest(firstRequestId);
    const requestD = await container.resolveProvider(RequestService, {
      requestId: firstRequestId,
    });
    expect(requestD).not.toBe(requestA);

    await container.destroyProviders();
    expect(events).toEqual(['init:1', 'resolve:1', 'destroy:1']);
  });
});
