import { describe, expect, it } from 'bun:test';
import { ConfigurationException } from '@bunito/common';
import { ContainerCompiler } from './container-compiler';
import { Module, Provider } from './decorators';
import { Id } from './id';
import { setClassDecoratorMetadata } from './metadata';

describe('ContainerCompiler', () => {
  it('compiles module schemas, decorated providers, exports, groups, and components', () => {
    const group = Symbol('group');
    const Component = () => {
      return <TTarget extends new (...args: never[]) => unknown>(
        target: TTarget,
        context: ClassDecoratorContext,
      ) => {
        setClassDecoratorMetadata(Component, 'prop', context, { tag: 'component' });
        return target;
      };
    };

    @Provider({ group })
    @Component()
    class ExportedProvider {}

    @Provider()
    class ChildModuleProvider {}

    function plainFactoryProvider() {
      return 'plain-factory';
    }

    @Module({
      providers: [
        ExportedProvider,
        ChildModuleProvider,
        plainFactoryProvider,
        {
          token: 'factory',
          group,
          useFactory: () => 'factory',
        },
      ],
      exports: [ExportedProvider, 'factory'],
    })
    class ChildModule {}

    @Component()
    class PlainComponent {}

    const rootSchema = {
      token: 'root-schema',
      imports: [ChildModule],
      providers: [PlainComponent],
      exports: [ChildModule],
    };

    const compiler = new ContainerCompiler(rootSchema);
    const rootModuleId = Id.for(rootSchema);
    const childModuleId = Id.for(ChildModule);

    expect(compiler.rootModuleId).toBe(rootModuleId);
    expect(compiler.getModule(rootModuleId).children).toEqual(new Set([childModuleId]));
    expect(compiler.getModule(childModuleId).parents).toEqual(new Set([rootModuleId]));
    expect(compiler.getModule(rootModuleId).components).toEqual(
      new Set([Id.for(PlainComponent)]),
    );
    expect(compiler.getProvider(Id.for(ExportedProvider)).moduleIds).toEqual(
      new Set([childModuleId, rootModuleId]),
    );
    expect(compiler.getProvider(Id.for(plainFactoryProvider)).schema).toEqual({
      useFactory: plainFactoryProvider,
    });
    expect(
      compiler.getModule(rootModuleId).providers?.get(Id.for(ExportedProvider)),
    ).toBe(childModuleId);
    expect(compiler.getModule(rootModuleId).providers?.get(Id.for('factory'))).toBe(
      childModuleId,
    );
    expect(compiler.locateProviders(group)).toEqual([
      {
        providerId: Id.for(ExportedProvider),
        moduleId: childModuleId,
      },
      {
        providerId: Id.for('factory'),
        moduleId: childModuleId,
      },
    ]);
    expect(compiler.locateComponents(Component)).toEqual({
      moduleId: rootModuleId,
      components: [
        {
          useClass: PlainComponent,
          props: [
            {
              propKind: 'class',
              options: { tag: 'component' },
            },
          ],
        },
      ],
      children: [
        {
          moduleId: childModuleId,
          components: [
            {
              useProvider: Id.for(ExportedProvider),
              props: [
                {
                  propKind: 'class',
                  options: { tag: 'component' },
                },
              ],
            },
          ],
        },
      ],
    });
    expect(compiler.locateComponents(Component, childModuleId)).toEqual({
      moduleId: childModuleId,
      components: [
        {
          useProvider: Id.for(ExportedProvider),
          props: [
            {
              propKind: 'class',
              options: { tag: 'component' },
            },
          ],
        },
      ],
    });
    expect(compiler.locateComponents(Symbol as never)).toBeUndefined();
    expect(() =>
      compiler.locateComponents(Symbol as never, Id.unique('Missing')),
    ).toThrow('Module Missing');
    expect(compiler.locateProviders(Symbol('missing'))).toEqual([]);
    expect(compiler.getProvider(Id.for('missing'), false)).toBeUndefined();
    expect(compiler.getModule(Id.for('missing'), false)).toBeUndefined();
  });

  it('compiles module classes as providers when provider options are present', () => {
    @Module({
      scope: 'module',
    })
    class RootModule {}

    const compiler = new ContainerCompiler(RootModule);

    expect(
      compiler.getModule(Id.for(RootModule)).providers?.has(Id.for(RootModule)),
    ).toBe(true);
  });

  it('rejects invalid module and provider declarations', () => {
    expect(() => new ContainerCompiler(class MissingModule {})).toThrow(
      '@Module() decorator is missing',
    );

    @Module({
      providers: [{} as never],
    })
    class MissingProviderOptionsModule {}

    expect(() => new ContainerCompiler(MissingProviderOptionsModule)).toThrow(
      'Provider options are missing',
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

    @Module()
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

    const DuplicateComponent = () => {
      return <TTarget extends new (...args: never[]) => unknown>(
        target: TTarget,
        context: ClassDecoratorContext,
      ) => {
        setClassDecoratorMetadata(DuplicateComponent, 'prop', context, {
          duplicate: true,
        });
        return target;
      };
    };

    @DuplicateComponent()
    class DuplicateClass {}

    @Module({
      providers: [DuplicateClass, DuplicateClass],
    })
    class DuplicateClassModule {}

    expect(() => new ContainerCompiler(DuplicateClassModule)).toThrow(
      'is already defined',
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

    expect(() => new ContainerCompiler(123 as never)).toThrow(ConfigurationException);
  });
});
