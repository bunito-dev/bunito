import { describe, expect, it } from 'bun:test';
import type { Class } from '@bunito/common';
import { MODULE_ID, PARENT_MODULE_IDS, REQUEST_ID, ROOT_MODULE_ID } from './constants';
import { ContainerCompiler } from './container-compiler';
import { Module, OnBoot, OnDestroy, OnInit, OnResolve, Provider } from './decorators';
import { Id } from './id';
import {
  createComponentDecorator,
  createComponentFieldDecorator,
  createComponentMethodDecorator,
  createComponentOptionsDecorator,
  createExtensionDecorator,
} from './utils';

declare global {
  namespace Bonito {
    interface ModuleComponents {
      widgets: Class[];
    }
  }
}

const WIDGET_COMPONENT = Symbol('test(WIDGET_COMPONENT)');
const TEST_EXTENSION = Symbol('test(TEST_EXTENSION)');

describe('ContainerCompiler', () => {
  it('compiles modules, components and extensions', () => {
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
      @OnInit()
      onInit(): void {}

      @OnResolve()
      onResolve(): void {}

      @OnBoot()
      onBoot(): void {}

      @OnDestroy()
      onDestroy(): void {}
    }

    @createComponentOptionsDecorator(WIDGET_COMPONENT, { kind: 'path', path: '/module' })
    @createComponentDecorator(WIDGET_COMPONENT, { kind: 'path', path: '/widgets' })
    class WidgetController {
      @createComponentFieldDecorator(WIDGET_COMPONENT, { source: 'field' })
      readonly kind = 'widget';

      @createComponentMethodDecorator(WIDGET_COMPONENT, { source: 'method' })
      handle(): string {
        return 'handled';
      }
    }

    @createExtensionDecorator(TEST_EXTENSION, 'router', { scope: 'singleton' })
    class RouterExtension {}

    @Module({
      providers: [
        LifecycleProvider,
        {
          token: 'factory',
          useFactory: (moduleId: Id) => ({ moduleId }),
          injects: [MODULE_ID],
        },
        {
          token: 'value',
          useValue: 42,
        },
      ],
      widgets: [WidgetController, RouterExtension],
      exports: [LifecycleProvider, 'factory', 'value'],
    })
    class ChildModule {}

    @Module({
      imports: [ChildModule],
      exports: [LifecycleProvider],
    })
    class RootModule {}

    const compiler = new ContainerCompiler(RootModule);
    const childModuleId = Id.for(ChildModule);
    const lifecycleId = Id.for(LifecycleProvider);

    expect(compiler.getProvider(lifecycleId, Id.for(RootModule))).toEqual([
      childModuleId,
      expect.objectContaining({
        scope: 'singleton',
      }),
    ]);
    expect(compiler.getProvider(Id.for('missing'), childModuleId)).toEqual([]);
    expect(compiler.getExtensions(TEST_EXTENSION)).toEqual([
      expect.objectContaining({
        moduleId: childModuleId,
        providerId: Id.for(RouterExtension),
        options: 'router',
      }),
    ]);
    expect(compiler.getComponents(WIDGET_COMPONENT)).toEqual([
      expect.objectContaining({
        moduleId: childModuleId,
        parentModuleIds: new Set([Id.for(RootModule)]),
        providerId: Id.for(WidgetController),
        options: [
          { kind: 'path', path: '/widgets' },
          { kind: 'path', path: '/module' },
        ],
        fields: [{ propKey: 'kind', options: { source: 'field' } }],
        methods: [{ propKey: 'handle', options: { source: 'method' } }],
      }),
    ]);
  });

  it('throws meaningful configuration errors', () => {
    class MissingDecoratorModule {}

    @Provider()
    class InvalidWidgetProvider {}

    @Module({
      widgets: [InvalidWidgetProvider],
    })
    class InvalidWidgetModule {}

    const circular = {} as { imports?: (typeof circular)[] };
    circular.imports = [circular];

    expect(() => new ContainerCompiler(MissingDecoratorModule)).toThrow(
      '@Module() decorator is missing',
    );
    expect(() => new ContainerCompiler(circular)).toThrow('Circular dependency detected');
    expect(() => new ContainerCompiler(InvalidWidgetModule)).toThrow(
      'Unsupported component',
    );
    expect(() => new ContainerCompiler({ exports: ['missing'] })).toThrow(
      'Provider missing#1 not found',
    );
    expect(() => new ContainerCompiler({ providers: [{} as never] })).toThrow(
      'Missing provider options',
    );
    expect(() => new ContainerCompiler({}).getModule(Id.unique('Missing'))).toThrow(
      'Module Missing#1 not found',
    );
  });

  it('re-exports imported module provider ids when exporting a child module', () => {
    @Provider()
    class LeafProvider {}

    @Module({
      providers: [LeafProvider],
      exports: [LeafProvider],
    })
    class LeafModule {}

    @Module({
      imports: [LeafModule],
      exports: [LeafModule],
    })
    class MiddleModule {}

    @Module({
      imports: [MiddleModule],
    })
    class RootModule {}

    const compiler = new ContainerCompiler(RootModule);
    const leafProviderId = Id.for(LeafProvider);
    const leafModuleId = Id.for(LeafModule);

    expect(compiler.getProvider(leafProviderId, Id.for(MiddleModule))).toEqual([
      leafModuleId,
      expect.objectContaining({
        scope: 'singleton',
      }),
    ]);
    expect(compiler.getProvider(leafProviderId, Id.for(RootModule))).toEqual([
      leafModuleId,
      expect.objectContaining({
        scope: 'singleton',
      }),
    ]);
  });
});
