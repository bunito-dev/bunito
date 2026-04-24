import { describe, expect, it } from 'bun:test';
import { ConfigurationException } from '@bunito/common';
import { ContainerCompiler } from './container-compiler';
import { ClassMethod, ClassOptions, Component, Extension, Module } from './decorators';
import { Id } from './id';

describe('ContainerCompiler', () => {
  it('compiles modules, providers, extensions, and component metadata', () => {
    const componentKey = Symbol('component');
    const extensionKey = Symbol('extension');

    class GlobalProvider {}

    @Extension('TestExtension', extensionKey, { format: 'json' })
    class TestExtension {}

    @ClassOptions(componentKey, { prefix: '/api' })
    @Component('TestComponent', componentKey, { prefix: '/users' }, { scope: 'request' })
    class TestController {
      @ClassMethod(componentKey, { path: '/' })
      list(): void {
        //
      }
    }

    @Module({
      providers: [
        {
          useClass: GlobalProvider,
        },
      ],
      extensions: [TestExtension],
      controllers: [TestController],
      exports: [GlobalProvider],
    } as never)
    class ChildModule {}

    @Module({
      imports: [ChildModule],
      exports: [ChildModule],
    })
    class RootModule {}

    const compiler = new ContainerCompiler(RootModule);
    const rootModuleId = Id.for(RootModule);
    const childModuleId = Id.for(ChildModule);

    expect(compiler.rootModuleId).toBe(rootModuleId);
    expect(compiler.getModule(rootModuleId).children).toEqual(new Set([childModuleId]));
    expect(compiler.getExtensions(extensionKey)).toEqual([
      {
        providerId: Id.for(TestExtension),
        moduleId: childModuleId,
        options: {
          format: 'json',
        },
      },
    ]);
    expect(compiler.getComponents(componentKey, rootModuleId)).toEqual([
      expect.objectContaining({
        moduleId: childModuleId,
        useProviderId: Id.for(TestController),
        options: [
          {
            prefix: '/users',
          },
          {
            prefix: '/api',
          },
        ],
        props: [
          {
            kind: 'method',
            propKey: 'list',
            options: {
              path: '/',
            },
          },
        ],
      }),
    ]);
  });

  it('rejects invalid module graphs and provider declarations', () => {
    expect(() => new ContainerCompiler(class MissingModule {})).toThrow(
      ConfigurationException,
    );

    @Module({
      providers: [{} as never],
    })
    class InvalidProviderModule {}

    expect(() => new ContainerCompiler(InvalidProviderModule)).toThrow(
      ConfigurationException,
    );

    const circularModule = {
      imports: [] as unknown[],
    };
    circularModule.imports.push(circularModule);

    expect(() => new ContainerCompiler(circularModule as never)).toThrow(
      ConfigurationException,
    );
  });

  it('returns empty provider lookup for unknown modules or providers', () => {
    @Module()
    class RootModule {}

    const compiler = new ContainerCompiler(RootModule);

    expect(compiler.getProvider(Id.for('missing'), Id.for(RootModule))).toEqual([]);
    expect(compiler.getProvider(Id.for('missing'), Id.unique('Module'))).toEqual([]);
    expect(() => compiler.getModule(Id.unique('Module'))).toThrow(ConfigurationException);
  });
});
