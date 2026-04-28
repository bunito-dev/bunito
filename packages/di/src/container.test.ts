import { describe, expect, it } from 'bun:test';
import { Container } from './container';
import {
  Module,
  OnDestroy,
  OnInit,
  OnResolve,
  Provider,
  setClassOptionsDecoratorMetadata,
} from './decorators';
import { Id } from './id';

describe('Container', () => {
  it('resolves providers, manual values, components, lifecycle triggers, and teardown', async () => {
    const marker = () => {
      return <TTarget extends new (...args: never[]) => unknown>(
        target: TTarget,
        context: ClassDecoratorContext,
      ) => {
        setClassOptionsDecoratorMetadata(marker, context, { marked: true });
        return target;
      };
    };
    const events: string[] = [];

    @Provider()
    @marker()
    class Service {
      @OnInit()
      init(): void {
        events.push('init');
      }

      @OnDestroy()
      destroy(): void {
        events.push('destroy');
      }

      @OnResolve()
      resolved(): void {
        events.push('resolve');
      }
    }

    @Module({
      providers: [Service],
    })
    class RootModule {}

    const container = new Container(RootModule);
    const requestId = Id.unique('Request');

    container.setProvider('manual', 'manual-value');

    const service = await container.resolveProvider(Service);
    const manual = await container.resolveProvider<string>('manual');
    const missing = await container.tryResolveProvider('missing');
    const injections = await container.resolveInjections(Service, [{ useValue: 'arg' }]);

    expect(service).toBeInstanceOf(Service);
    expect(manual).toBe('manual-value');
    expect(missing).toBeUndefined();
    expect(injections).toEqual(['arg']);
    expect(container.locateComponents(marker)?.classes).toEqual([
      {
        useProvider: Id.for(Service),
        metadata: expect.objectContaining({
          options: { marked: true },
        }),
      },
    ]);

    await container.triggerProviders(OnResolve);

    let initError: unknown;
    try {
      await container.triggerProviders(OnInit);
    } catch (error) {
      initError = error;
    }
    expect(initError).toBeInstanceOf(Error);
    expect((initError as Error).message).toContain('called more than once');

    await container.destroyRequest(requestId);
    await container.destroyProviders();

    expect(events).toEqual(['init', 'resolve', 'resolve', 'resolve', 'destroy']);
  });
});
