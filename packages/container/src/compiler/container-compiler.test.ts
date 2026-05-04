import { describe, expect, it } from 'bun:test';
import { ContainerException } from '../container.exception';
import type { ClassDecorator } from '../decorators';
import {
  createComponentDecorator,
  createExtensionDecorator,
  Module,
  Provider,
} from '../decorators';
import { Id } from '../utils';
import { ContainerCompiler } from './container-compiler';

function Component(options?: unknown): ClassDecorator {
  return createComponentDecorator(Component, options);
}

function Extension(options?: Parameters<typeof createExtensionDecorator>[1]) {
  return createExtensionDecorator(Extension, options);
}

describe('ContainerCompiler', () => {
  it('compiles modules, decorated providers, exports, indexed extensions, and components', () => {
    @Extension()
    @Component({ tag: 'extension' })
    class ExportedExtension {}

    @Provider()
    class ChildProvider {}

    function plainFactoryProvider() {
      return 'plain-factory';
    }

    @Module({
      providers: [
        ExportedExtension,
        ChildProvider,
        plainFactoryProvider,
        {
          token: 'factory',
          useFactory: () => 'factory',
        },
      ],
      exports: [ExportedExtension, 'factory'],
    })
    class ChildModule {}

    @Component({ tag: 'plain-component' })
    class PlainComponent {}

    const rootOptions = {
      token: 'root-schema',
      imports: [ChildModule],
      providers: [PlainComponent],
      exports: [ChildModule],
    };

    const compiler = new ContainerCompiler(rootOptions);
    const rootModuleId = Id.for(rootOptions);
    const childModuleId = Id.for(ChildModule);

    expect(compiler.rootModuleId).toBe(rootModuleId);
    expect(compiler.getModule(rootModuleId).children).toEqual(new Set([childModuleId]));
    expect(compiler.getModule(childModuleId).parents).toEqual(new Set([rootModuleId]));
    expect(compiler.getModule(rootModuleId).components).toEqual([Id.for(PlainComponent)]);
    expect(compiler.getProvider(Id.for(ExportedExtension)).moduleIds).toEqual(
      new Set([childModuleId, rootModuleId]),
    );
    expect(compiler.getProvider(Id.for(plainFactoryProvider)).options).toEqual({
      useFactory: plainFactoryProvider,
    });
    expect(
      compiler.getModule(rootModuleId).providers?.get(Id.for(ExportedExtension)),
    ).toBe(childModuleId);
    expect(compiler.getModule(rootModuleId).providers?.get(Id.for('factory'))).toBe(
      childModuleId,
    );
    expect(compiler.getComponent(Id.for(ExportedExtension))).toEqual({
      useProvider: Id.for(ExportedExtension),
      options: new Map([[Component, { value: { tag: 'extension' } }]]),
    });
    expect(compiler.getComponent(Id.for(PlainComponent))).toEqual({
      useClass: PlainComponent,
      options: new Map([[Component, { value: { tag: 'plain-component' } }]]),
    });
    expect(compiler.getProviders(Extension)).toEqual([
      {
        providerId: Id.for(ExportedExtension),
        moduleId: childModuleId,
      },
    ]);
    expect(compiler.getProviders(Symbol as never)).toBeUndefined();
    expect(compiler.getProvider(Id.for('missing'), false)).toBeUndefined();
    expect(compiler.getModule(Id.for('missing'), false)).toBeUndefined();
    expect(compiler.getComponent(Id.for('missing'), false)).toBeUndefined();
  });

  it('compiles module classes as providers when provider options are present', () => {
    @Module({
      scope: 'module',
      providers: [],
      exports: [],
    })
    class RootModule {}

    const compiler = new ContainerCompiler(RootModule);

    expect(
      compiler.getModule(Id.for(RootModule)).providers?.has(Id.for(RootModule)),
    ).toBe(true);
  });

  it('locates class and provider components across child modules', () => {
    @Component({ tag: 'root' })
    @Module({
      imports: [],
    })
    class RootComponent {}

    @Component({ tag: 'child' })
    @Provider()
    class ChildComponent {}

    @Module({
      providers: [ChildComponent],
    })
    class ChildModule {}

    const rootOptions = {
      imports: [RootComponent, ChildModule],
    };
    const compiler = new ContainerCompiler(rootOptions);

    expect(compiler.locateComponents(Component)).toEqual({
      moduleId: Id.for(rootOptions),
      children: [
        {
          moduleId: Id.for(RootComponent),
          components: [
            {
              useClass: RootComponent,
              options: {
                value: {
                  tag: 'root',
                },
              },
            },
          ],
        },
        {
          moduleId: Id.for(ChildModule),
          components: [
            {
              useProvider: Id.for(ChildComponent),
              options: {
                value: {
                  tag: 'child',
                },
              },
            },
          ],
        },
      ],
    });
    function MissingComponent() {}

    expect(compiler.locateComponents(MissingComponent)).toBeUndefined();
  });

  it('rejects invalid module and provider declarations', () => {
    expect(() => new ContainerCompiler(class MissingModule {})).toThrow(
      'Missing @Module() metadata',
    );

    @Module({
      providers: [{} as never],
    })
    class MissingProviderOptionsModule {}

    expect(() => new ContainerCompiler(MissingProviderOptionsModule)).toThrow(
      'is missing provider options',
    );

    @Provider()
    class DuplicateProvider {}

    @Module({
      providers: [DuplicateProvider],
    })
    class DuplicateProviderChild {}

    @Module({
      providers: [DuplicateProvider],
      imports: [DuplicateProviderChild],
    })
    class DuplicateProviderRoot {}

    expect(() => new ContainerCompiler(DuplicateProviderRoot)).toThrow(
      'is already defined',
    );

    @Provider()
    class ImportProvider {}

    @Module({
      providers: [ImportProvider],
    })
    class DuplicateImportChild {}

    @Module({
      imports: [DuplicateImportChild, DuplicateImportChild],
    })
    class DuplicateImportRoot {}

    expect(() => new ContainerCompiler(DuplicateImportRoot)).toThrow(
      'is already imported',
    );

    const circularModule = {
      imports: [] as unknown[],
    };
    circularModule.imports.push(circularModule);

    expect(() => new ContainerCompiler(circularModule as never)).toThrow(
      'Circular module dependency detected',
    );

    @Module({
      exports: ['missing'],
    })
    class MissingExportModule {}

    expect(() => new ContainerCompiler(MissingExportModule)).toThrow('was not found');

    @Module({
      providers: [
        {
          token: 'duplicate-export',
          useValue: true,
        },
      ],
      exports: ['duplicate-export', 'duplicate-export'],
    })
    class DuplicateExportModule {}

    expect(() => new ContainerCompiler(DuplicateExportModule)).toThrow(
      'is already exported',
    );

    expect(() => new ContainerCompiler({})).toThrow(
      'must declare imports, exports, or providers',
    );
    expect(() => new ContainerCompiler(123 as never)).toThrow(ContainerException);
  });
});
